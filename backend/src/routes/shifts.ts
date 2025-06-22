import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { shiftClaims, shift } from "../lib/db/schema";
import { z } from "zod";
import { zValidator } from "../middlewares/validator-wrapper";

const shifts = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .use(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  })
  .get("/", async (c) => {
    const user = c.get("user");

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = (page - 1) * limit;

    if (user?.role === "user") {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // get shifts for the next week, including claims count
      const shifts = await db.query.shift.findMany({
        limit,
        offset,
        where: and(gte(shift.start, now), lt(shift.start, nextWeek)),
        orderBy: (shifts) => shifts.start,
        extras: {
          claimsCount:
            sql<number>`(SELECT COUNT(*) FROM shift_claims WHERE shift_claims.shift_id = ${shift.id})`.as(
              "claimsCount"
            ),
        },
      });

      // get total number of shifts
      const total = await db.query.shift
        .findMany({
          where: and(gte(shift.start, now), lt(shift.start, nextWeek)),
        })
        .then((shifts) => shifts.length);

      // return shifts and pagination
      return c.json({
        data: shifts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // For admin, include claims count for all shifts
    const shifts = await db.query.shift.findMany({
      limit,
      offset,
      orderBy: (shifts) => shifts.start,
      extras: {
        claimsCount:
          sql`(SELECT COUNT(*) FROM shift_claims WHERE shift_claims.shift_id = ${shift.id})`.as(
            "claimsCount"
          ),
      },
    });

    const total = await db.query.shift
      .findMany()
      .then((shifts) => shifts.length);

    return c.json({
      data: shifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/:id", async (c) => {
    const shiftId = c.req.param("id");

    const shiftData = await db.query.shift.findFirst({
      where: eq(shift.id, shiftId),
    });

    if (!shiftData) {
      return c.json({ error: "Shift not found" }, 404);
    }

    return c.json(shiftData);
  })
  .get("/:id/claims", async (c) => {
    const shiftId = c.req.param("id");

    const claims = await db.query.shiftClaims.findMany({
      where: eq(shiftClaims.shiftId, shiftId),
      with: {
        user: true,
      },
    });

    return c.json(claims);
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        start: z.number(),
        end: z.number(),
        maxClaims: z.number(),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (user?.role !== "admin") {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { name, start, end, maxClaims } = c.req.valid("json");

      const newShift = await db
        .insert(shift)
        .values({
          name,
          maxClaims,
          start: new Date(start),
          end: new Date(end),
        })
        .returning();

      return c.json(newShift);
    }
  )
  .delete("/:shiftId/claims/:userId", async (c) => {
    const user = c.get("user");
    const userId = c.req.param("userId");

    if (user?.role !== "admin" && user?.id !== userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const shiftId = c.req.param("shiftId");

    await db
      .delete(shiftClaims)
      .where(
        and(eq(shiftClaims.shiftId, shiftId), eq(shiftClaims.userId, userId))
      );

    return c.json({ success: true });
  })
  .post("/:id/claims", async (c) => {
    const user = c.get("user");
    const shiftId = c.req.param("id");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    // Check if shift exists
    const shiftData = await db.query.shift.findFirst({
      where: eq(shift.id, shiftId),
    });
    if (!shiftData) {
      return c.json({ error: "Shift not found" }, 404);
    }
    // Check if already claimed
    const existingClaim = await db.query.shiftClaims.findFirst({
      where: and(
        eq(shiftClaims.shiftId, shiftId),
        eq(shiftClaims.userId, user.id)
      ),
    });
    if (existingClaim) {
      return c.json({ error: "Already claimed" }, 400);
    }
    // Check if shift is full
    const claimsCount = await db.query.shiftClaims.findMany({
      where: eq(shiftClaims.shiftId, shiftId),
    });
    if (claimsCount.length >= shiftData.maxClaims) {
      return c.json({ error: "Shift is full" }, 400);
    }
    // Insert claim
    await db.insert(shiftClaims).values({
      userId: user.id,
      shiftId,
      createdAt: new Date(),
    });
    return c.json({ success: true });
  });

export default shifts;

export type shifts = typeof shifts;

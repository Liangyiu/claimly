import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { and, eq, gte, lt } from "drizzle-orm";
import { shiftClaims, user, shift } from "../lib/db/schema";
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

      // get shifts for the next week
      const shifts = await db.query.shift.findMany({
        limit,
        offset,
        where: and(gte(shift.start, now), lt(shift.start, nextWeek)),
        orderBy: (shifts) => shifts.start,
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

    const shifts = await db.query.shift.findMany({
      limit,
      offset,
      orderBy: (shifts) => shifts.start,
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
  .get("/claims", async (c) => {
    const user = c.get("user");

    const claims = await db.query.shiftClaims.findMany({
      where: eq(shiftClaims.userId, user!.id),
      with: {
        shift: true,
      },
    });

    return c.json(claims);
  });

export default shifts;

export type shifts = typeof shifts;

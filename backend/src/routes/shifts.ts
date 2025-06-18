import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { and, eq, gte, lt } from "drizzle-orm";
import { shiftClaims, user, workShift } from "../lib/db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const shifts = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  // .use(async (c, next) => {
  //   const user = c.get("user");

  //   if (!user) {
  //     return c.json({ error: "Unauthorized" }, 401);
  //   }

  //   await next();
  // })
  .get("/", async (c) => {
    const user = c.get("user");

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = (page - 1) * limit;

    if (user?.role === "user") {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // get shifts for the next week
      const shifts = await db.query.workShift.findMany({
        limit,
        offset,
        where: and(gte(workShift.start, now), lt(workShift.start, nextWeek)),
        orderBy: (shifts) => shifts.start,
      });

      // get total number of shifts
      const total = await db.query.workShift
        .findMany({
          where: and(gte(workShift.start, now), lt(workShift.start, nextWeek)),
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

    const shifts = await db.query.workShift.findMany({
      limit,
      offset,
      orderBy: (shifts) => shifts.start,
    });

    const total = await db.query.workShift
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

    const shift = await db.query.workShift.findFirst({
      where: eq(workShift.id, shiftId),
    });

    if (!shift) {
      return c.json({ error: "Shift not found" }, 404);
    }

    return c.json(shift);
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        start: z.number(),
        end: z.number(),
        maxClaims: z.number(),
        description: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (user?.role !== "admin") {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { start, end, maxClaims, description } = c.req.valid("json");

      const shift = await db
        .insert(workShift)
        .values({
          description,
          maxClaims,
          start: new Date(start),
          end: new Date(end),
        })
        .returning();

      return c.json(shift);
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

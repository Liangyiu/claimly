import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { eq, sql } from "drizzle-orm";
import { shiftClaims, shift } from "../lib/db/schema";

const claims = new Hono<{
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

    const claims = await db.query.shiftClaims.findMany({
      where: eq(shiftClaims.userId, user!.id),
      with: {
        shift: {
          extras: {
            claimsCount:
              sql<number>`(SELECT COUNT(*) FROM shift_claims WHERE shift_claims.shift_id = ${shift.id})`.as(
                "claimsCount"
              ),
          },
        },
      },
      limit,
      offset,
    });

    const formattedClaims = claims.map((claim) => ({
      ...claim.shift,
      claim: {
        createdAt: claim.createdAt,
        userId: claim.userId,
        shiftId: claim.shiftId,
      },
    }));

    const total = await db.query.shiftClaims
      .findMany({ where: eq(shiftClaims.userId, user!.id) })
      .then((all) => all.length);

    return c.json({
      data: formattedClaims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

export default claims;

export type claims = typeof claims;

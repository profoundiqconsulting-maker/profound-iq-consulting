import "dotenv/config";
import { afterEach, describe, expect, it } from "vitest";
import { getDb } from "./db";
import { appRouter } from "./routers";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const databaseTest = testDatabaseUrl ? it : it.skip;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe("database-backed API integration", () => {
  databaseTest(
    "loads a learner roadmap through tRPC and its Drizzle models",
    async () => {
      process.env.DATABASE_URL = testDatabaseUrl;
      const db = await getDb();
      if (!db) {
        throw new Error(
          "TEST_DATABASE_URL did not produce a database connection."
        );
      }

      try {
        const now = new Date();
        const caller = appRouter.createCaller({
          user: {
            id: 1,
            openId: `readonly-integration-${process.pid}`,
            name: "Read-only integration",
            email: "integration@example.invalid",
            loginMethod: "test",
            role: "user",
            createdAt: now,
            updatedAt: now,
            lastSignedIn: now,
          },
          req: { protocol: "http", headers: {} } as never,
          res: {} as never,
        });

        const result = await caller.roadmap.list();
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.discountActive).toBe("boolean");
      } finally {
        await db.$client.end();
      }
    }
  );
});

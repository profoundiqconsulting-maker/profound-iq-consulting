import { hashPassword } from "../server/localAuthCrypto";
import { getDb, createLocalUser, updateUserRole, findUserByLocalIdentifier } from "../server/db";

const ADMIN_USERNAME = "profoundiq";
const ADMIN_EMAIL = "profoundiqconsulting@gmail.com";
const ADMIN_PASSWORD = "Profoundiq@2026";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log(`Checking for admin user: ${ADMIN_USERNAME} / ${ADMIN_EMAIL}`);

  const existing = await findUserByLocalIdentifier(ADMIN_USERNAME);
  const existingByEmail = await findUserByLocalIdentifier(ADMIN_EMAIL);

  const user = existing || existingByEmail;

  if (user) {
    console.log(`User found (id=${user.id}, role=${user.role})`);

    if (user.role !== "admin") {
      await updateUserRole(user.openId, "admin");
      console.log("Promoted user to admin.");
    } else {
      console.log("User already has admin role.");
    }

    const needsPassword = !user.passwordHash;
    if (needsPassword) {
      const passwordHash = hashPassword(ADMIN_PASSWORD);
      // Update password hash directly via drizzle
      const { eq } = await import("drizzle-orm");
      const { users } = await import("../drizzle/schema");
      await db.update(users).set({ passwordHash }).where(eq(users.openId, user.openId));
      console.log("Set password for existing user.");
    } else {
      console.log("User already has a password hash.");
    }

    if (!user.username || user.username !== ADMIN_USERNAME) {
      const { eq } = await import("drizzle-orm");
      const { users } = await import("../drizzle/schema");
      await db.update(users).set({ username: ADMIN_USERNAME }).where(eq(users.openId, user.openId));
      console.log("Updated username.");
    }

    if (!user.email || user.email !== ADMIN_EMAIL) {
      const { eq } = await import("drizzle-orm");
      const { users } = await import("../drizzle/schema");
      await db.update(users).set({ email: ADMIN_EMAIL }).where(eq(users.openId, user.openId));
      console.log("Updated email.");
    }
  } else {
    console.log("User not found. Creating admin user...");
    const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const passwordHash = hashPassword(ADMIN_PASSWORD);
    await createLocalUser({
      openId,
      name: "Profound IQ Admin",
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user with openId=${openId}`);
  }

  console.log("Admin bootstrap complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Admin bootstrap failed:", error);
  process.exit(1);
});

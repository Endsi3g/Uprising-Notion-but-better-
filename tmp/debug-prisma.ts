import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

try {
  const prisma = new PrismaClient();
  console.log("Prisma initialized successfully with new PrismaClient()");
} catch (e) {
  console.log("Prisma failed with new PrismaClient():", e.message);
}

try {
    const prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL
    } as any);
    console.log("Prisma initialized successfully with datasourceUrl");
} catch (e) {
    console.log("Prisma failed with datasourceUrl:", e.message);
}

try {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    } as any);
    console.log("Prisma initialized successfully with datasources: { db: { url } }");
} catch (e) {
    console.log("Prisma failed with datasources: { db: { url } }:", e.message);
}

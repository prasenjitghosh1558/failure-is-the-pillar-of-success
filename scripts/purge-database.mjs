import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Purging all auto-generated and pre-seeded database records from NEXTRAK...");

  const delLogs = await prisma.auditLog.deleteMany();
  const delNotifs = await prisma.notification.deleteMany();
  const delStops = await prisma.routeStop.deleteMany();
  const delRoutes = await prisma.route.deleteMany();
  const delEvents = await prisma.trackingEvent.deleteMany();
  const delShipments = await prisma.shipment.deleteMany();
  const delVehicles = await prisma.vehicle.deleteMany();
  const delDrivers = await prisma.driver.deleteMany();
  const delUsers = await prisma.user.deleteMany();

  console.log(`✅ Purged successfully:
  - AuditLogs: ${delLogs.count}
  - Notifications: ${delNotifs.count}
  - RouteStops: ${delStops.count}
  - Routes: ${delRoutes.count}
  - TrackingEvents: ${delEvents.count}
  - Shipments: ${delShipments.count}
  - Vehicles: ${delVehicles.count}
  - Drivers: ${delDrivers.count}
  - Users: ${delUsers.count}
  Database prisma/dev.db is now completely pristine and empty.`);
}

main()
  .catch((e) => {
    console.error("Purge error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


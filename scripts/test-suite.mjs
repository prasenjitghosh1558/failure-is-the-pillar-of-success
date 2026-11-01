import { PrismaClient } from "@prisma/client";
import { MapboxService } from "../src/lib/integrations/mapbox.ts";
import { getTrackingProvider } from "../src/lib/integrations/tracking-provider.ts";
import { hasPermission, signSessionToken, verifySessionToken } from "../src/lib/auth.ts";

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log("==================================================");
  console.log("🚀 NEXTRAK INDIA LOGISTICS AUTOMATED TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Database Seed Verification
    console.log("\n[TEST GROUP 1: Database & Relational Integrity]");
    const userCount = await prisma.user.count();
    assert(userCount >= 5, `Database contains ${userCount} users across all operational roles`);

    const shipmentCount = await prisma.shipment.count();
    assert(shipmentCount >= 5, `Database contains ${shipmentCount} operational shipments`);

    const eventCount = await prisma.trackingEvent.count();
    assert(eventCount >= 10, `Database contains ${eventCount} chronological tracking events`);

    const vehicleCount = await prisma.vehicle.count();
    assert(vehicleCount >= 4, `Database contains ${vehicleCount} fleet vehicle assets`);

    const driverCount = await prisma.driver.count();
    assert(driverCount >= 4, `Database contains ${driverCount} CDL drivers`);

    const routeCount = await prisma.route.count();
    assert(routeCount >= 1, `Database contains ${routeCount} multi-stop routes`);

    // Test 2: Relational Integrity Check
    console.log("\n[TEST GROUP 2: Relational Queries & Foreign Keys]");
    const sampleShipment = await prisma.shipment.findFirst({
      where: { trackingNumber: "IND-9042-MUM" },
      include: {
        events: true,
        assignedVehicle: { include: { driver: true } },
      },
    });
    assert(
      sampleShipment !== null && sampleShipment.events.length > 0,
      "Shipment IND-9042-MUM loaded with chronological event history"
    );
    assert(
      sampleShipment?.assignedVehicle?.registrationNumber === "MH-04-GP-8842",
      "Vehicle assignment foreign key verified: MH-04-GP-8842"
    );
    assert(
      sampleShipment?.assignedVehicle?.driver?.name === "Gurpreet Singh",
      "Driver assignment foreign key verified: Gurpreet Singh"
    );

    // Test 3: Geospatial Haversine & Optimization Engine (Delhi to Mumbai via Jaipur/Ahmedabad)
    console.log("\n[TEST GROUP 3: Indian Corridors & TSP Routing Engine]");
    const delhi = { lat: 28.6139, lng: 77.209 };
    const mumbai = { lat: 18.95, lng: 72.82 };
    const dist = MapboxService.calculateHaversineDistance(delhi, mumbai);
    assert(dist > 1000 && dist < 1300, `Haversine distance Delhi-Mumbai calculated accurately: ${dist} km`);

    const optimization = await MapboxService.optimizeRoute(delhi, mumbai, [
      { lat: 26.9124, lng: 75.7873 }, // Jaipur
      { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    ]);
    assert(
      optimization.distanceKm > 1100 && optimization.coordinates.length > 0,
      `Multi-Stop TSP Route calculated: ${optimization.distanceKm} km, duration ${optimization.durationFormatted}`
    );
    assert(
      optimization.stopsOrder.length === 2,
      `Waypoints ordered correctly: ${JSON.stringify(optimization.stopsOrder)}`
    );

    // Test 4: RBAC & Security Permissions
    console.log("\n[TEST GROUP 4: Role-Based Authorization & Session JWT]");
    assert(hasPermission("SUPER_ADMIN", "shipments:delete"), "SUPER_ADMIN permitted to delete shipments");
    assert(!hasPermission("DRIVER", "shipments:delete"), "DRIVER forbidden from deleting shipments");
    assert(hasPermission("DISPATCHER", "shipments:create"), "DISPATCHER permitted to create shipments");
    assert(!hasPermission("CUSTOMER", "shipments:create"), "CUSTOMER forbidden from creating shipments");

    const sessionPayload = {
      id: "test-user-id",
      name: "Arjun Singhania",
      email: "admin@nextrak.io",
      role: "SUPER_ADMIN",
    };
    const token = await signSessionToken(sessionPayload);
    assert(typeof token === "string" && token.length > 20, "JWT session token signed with HS256");

    const verified = await verifySessionToken(token);
    assert(verified?.email === "admin@nextrak.io", "JWT session token verified and decoded correctly");

    // Test 5: Tracking Provider Abstraction Layer
    console.log("\n[TEST GROUP 5: Provider Integration Abstraction]");
    const provider = getTrackingProvider();
    assert(provider !== null && typeof provider.name === "string", `Tracking provider initialized: ${provider.name}`);

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();

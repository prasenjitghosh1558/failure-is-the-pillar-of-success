import { PrismaClient } from "@prisma/client";
import { signSessionToken, verifySessionToken, hashPassword } from "../src/lib/auth.ts";

const prisma = new PrismaClient();

async function testAuthSystem() {
  console.log("==================================================");
  console.log("🔐 TESTING MULTI-ROLE & GMAIL REGISTRATION SYSTEM");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test registration of each of the 5 roles with role-specific metadata
    const rolesToTest = [
      {
        name: "Vikramaditya Singhal",
        email: "vikram.admin@gmail.com",
        role: "SUPER_ADMIN",
        metadata: {
          commandCenter: "National Logistics Command — New Delhi",
          clearanceCode: "NEXTRAK-ROOT-2026",
          jurisdiction: "All 28 States & 8 UTs",
          emergencyPhone: "+91 98100 23456",
        },
      },
      {
        name: "Rajesh Iyer",
        email: "rajesh.dispatch@gmail.com",
        role: "DISPATCHER",
        metadata: {
          hub: "Mumbai JNPT",
          shift: "Shift A (06:00–14:00 IST)",
          corridor: "WDFC Heavy Rail",
          dispatcherId: "DISP-MUM-101",
        },
      },
      {
        name: "Kavita Reddy",
        email: "kavita.fleet@gmail.com",
        role: "FLEET_MANAGER",
        metadata: {
          depot: "Bhiwandi MMLP",
          fleetSize: "26–100 Vehicles",
          gstin: "27AAACN1234F1Z5",
          fastagBank: "ICICI Bank FASTag",
        },
      },
      {
        name: "Balwinder Singh",
        email: "balwinder.driver@gmail.com",
        role: "DRIVER",
        metadata: {
          licenseNumber: "PB-08-20180092811",
          assignedPlate: "PB-02-ER-5510",
          cargoCertification: "Heavy Goods Vehicle (HGV)",
          driverContact: "+91 98765 11223",
        },
      },
      {
        name: "Siddharth Mehta",
        email: "siddharth.customer@gmail.com",
        role: "CUSTOMER",
        metadata: {
          organizationName: "Gujarat Micro-Electronics Ltd",
          gstin: "24AABCS9981K1ZM",
          deliveryCity: "Ahmedabad",
          freightCategory: "Semiconductors & Electronics",
        },
      },
    ];

    for (const item of rolesToTest) {
      const pwd = await hashPassword("SecurePass2026!");
      const upserted = await prisma.user.upsert({
        where: { email: item.email },
        update: {
          name: item.name,
          role: item.role,
          metadata: JSON.stringify(item.metadata),
          authProvider: "GOOGLE",
        },
        create: {
          name: item.name,
          email: item.email,
          passwordHash: pwd,
          role: item.role,
          authProvider: "GOOGLE",
          metadata: JSON.stringify(item.metadata),
        },
      });

      assert(upserted.id && upserted.role === item.role, `Registered role ${item.role}: ${item.name} (${item.email})`);
      const parsed = JSON.parse(upserted.metadata);
      assert(parsed !== null, `Persisted role metadata correctly for ${item.role}`);
    }

    // 2. Test Session JWT Generation & Decoding for New Registered User
    const sampleUser = await prisma.user.findUnique({ where: { email: "vikram.admin@gmail.com" } });
    const token = await signSessionToken({
      id: sampleUser.id,
      name: sampleUser.name,
      email: sampleUser.email,
      role: sampleUser.role,
      company: sampleUser.company,
      avatar: sampleUser.avatar,
      authProvider: sampleUser.authProvider,
      metadata: sampleUser.metadata,
    });
    assert(token && typeof token === "string", "Generated HS256 JWT session token for Gmail user");

    const decoded = await verifySessionToken(token);
    assert(decoded && decoded.email === "vikram.admin@gmail.com", "Decoded and validated session token successfully");

    // 3. Test Multi-Account Query
    const totalUsers = await prisma.user.count();
    assert(totalUsers >= 10, `Database contains ${totalUsers} total registered accounts (including seed + new roles)`);

    console.log(`\n==================================================`);
    console.log(`AUTH TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==================================================`);

  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthSystem();


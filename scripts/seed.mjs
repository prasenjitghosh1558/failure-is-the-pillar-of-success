import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEXTRAK India database with operational records...");

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users across roles
  const superAdmin = await prisma.user.create({
    data: {
      name: "Arjun Singhania",
      email: "admin@nextrak.io",
      passwordHash,
      role: "SUPER_ADMIN",
      company: "NEXTRAK India Logistics Command",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      name: "Rohit Deshmukh",
      email: "dispatch@nextrak.io",
      passwordHash,
      role: "DISPATCHER",
      company: "Golden Quadrilateral Freight Operations",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const fleetManager = await prisma.user.create({
    data: {
      name: "Pooja Nair",
      email: "fleet@nextrak.io",
      passwordHash,
      role: "FLEET_MANAGER",
      company: "Bharat Telematics & Multi-Axle Fleet",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      name: "Gurpreet Singh",
      email: "marcus.driver@nextrak.io",
      passwordHash,
      role: "DRIVER",
      company: "Western Corridor Heavy Haul",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      email: "sarah.jenkins@acmecorp.com",
      passwordHash,
      role: "CUSTOMER",
      company: "Tata Precision Auto Tech",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: "Gurpreet Singh",
      email: "marcus.driver@nextrak.io",
      phone: "+91 98110 44219",
      licenseNumber: "PB-08-CDL-2018-9941",
      status: "ON_DELIVERY",
      rating: 4.96,
      deliveriesCompleted: 482,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Rajesh Patil",
      email: "rajesh.patil@nextrak.io",
      phone: "+91 98220 55102",
      licenseNumber: "MH-04-CDL-2019-8812",
      status: "ON_DELIVERY",
      rating: 4.91,
      deliveriesCompleted: 312,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: "Murugan Sundaram",
      email: "murugan.s@nextrak.io",
      phone: "+91 94440 12890",
      licenseNumber: "TN-01-CDL-2020-7714",
      status: "AVAILABLE",
      rating: 4.94,
      deliveriesCompleted: 265,
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      name: "Vikram Das",
      email: "vikram.das@nextrak.io",
      phone: "+91 98300 78219",
      licenseNumber: "WB-02-CDL-2017-5501",
      status: "ON_DELIVERY",
      rating: 4.89,
      deliveriesCompleted: 390,
    },
  });

  const driver5 = await prisma.driver.create({
    data: {
      name: "Amit Solanki",
      email: "amit.solanki@nextrak.io",
      phone: "+91 97240 66311",
      licenseNumber: "GJ-01-CDL-2021-3329",
      status: "AVAILABLE",
      rating: 4.87,
      deliveriesCompleted: 142,
    },
  });

  // 3. Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNumber: "MH-04-GP-8842",
      vehicleType: "Heavy Multi-Axle 55T",
      model: "Tata Prima 5530.S Euro VI",
      year: 2024,
      status: "IN_TRANSIT",
      fuelLevelPercent: 88.0,
      batteryPercent: 92.0,
      lastLatitude: 21.7051,
      lastLongitude: 72.9959, // Bharuch bypass (NH-48)
      telematicsProvider: "SAMSARA",
      driverId: driver1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNumber: "DL-1A-AZ-9901",
      vehicleType: "Double-Stack Container Loco",
      model: "WAG-12B Electric Freight Engine #60042",
      year: 2023,
      status: "IN_TRANSIT",
      fuelLevelPercent: 100,
      batteryPercent: 98.0,
      lastLatitude: 28.192,
      lastLongitude: 76.623, // Rewari Western DFC
      telematicsProvider: "GEOTAB",
      driverId: driver2.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      registrationNumber: "KA-01-MJ-4410",
      vehicleType: "Dedicated Cold-Chain Reefer",
      model: "BharatBenz 2823R (Carrier Reefer -20C)",
      year: 2024,
      status: "AVAILABLE",
      fuelLevelPercent: 94.0,
      batteryPercent: 95.0,
      lastLatitude: 12.9716,
      lastLongitude: 77.5946, // Bengaluru Hub
      telematicsProvider: "DEMO_TELEMATICS",
      driverId: driver3.id,
    },
  });

  const vehicle4 = await prisma.vehicle.create({
    data: {
      registrationNumber: "WB-29-B-4190",
      vehicleType: "Coastal Freight Trailer",
      model: "Ashok Leyland AVTR 4220 Multi-Axle",
      year: 2023,
      status: "IN_TRANSIT",
      fuelLevelPercent: 74.0,
      batteryPercent: 78.0,
      lastLatitude: 17.6868,
      lastLongitude: 83.2185, // Visakhapatnam corridor
      telematicsProvider: "SAMSARA",
      driverId: driver4.id,
    },
  });

  const vehicle5 = await prisma.vehicle.create({
    data: {
      registrationNumber: "GJ-06-XX-1120",
      vehicleType: "Electric Delivery Van",
      model: "Eicher Pro 2049 EV Light Cargo",
      year: 2024,
      status: "MAINTENANCE",
      fuelLevelPercent: 45.0,
      batteryPercent: 40.0,
      lastLatitude: 23.0225,
      lastLongitude: 72.5714, // Ahmedabad Mundra Terminal
      telematicsProvider: "DEMO_TELEMATICS",
      driverId: driver5.id,
    },
  });

  // 4. Create Shipments and Tracking Events (Indian Logistics Corridors)

  // Shipment 1: IND-9042-MUM (Delhi to Mumbai / JNPT)
  const ship1 = await prisma.shipment.create({
    data: {
      trackingNumber: "IND-9042-MUM",
      externalTrackingNumber: "EWB-DL-9840129841",
      carrier: "NEXTRAK Golden Quad Express",
      serviceType: "NH-48 Heavy Multi-Axle Express",
      currentStatus: "IN_TRANSIT",
      sourceType: "TELEMATICS_GPS",
      senderId: dispatcher.id,
      senderName: "NextGen Auto Ancillaries",
      senderAddress: "Alipur Multi-Modal Logistics Park",
      senderCity: "Delhi NCR",
      senderCountry: "India",
      recipientId: customerUser.id,
      recipientName: "Tata Motors Commercial Gateway",
      recipientAddress: "JNPT Terminal 2, Nhava Sheva",
      recipientCity: "Mumbai",
      recipientCountry: "India",
      originCity: "Delhi NCR",
      originState: "Delhi",
      originLat: 28.6139,
      originLng: 77.209,
      destinationCity: "Mumbai",
      destinationState: "Maharashtra",
      destinationLat: 18.95,
      destinationLng: 72.82,
      currentLat: 21.7051,
      currentLng: 72.9959,
      weightKg: 24500.0,
      dimensions: "12x2.5x2.8 meters",
      packageType: "Palletized Auto Components",
      packageDescription: "Precision Engine Transmissions (40 Crates)",
      specialInstructions: "FASTag toll clearance auto-verified. Keep sealed till JNPT berth gate.",
      estimatedDelivery: new Date(Date.now() + 86400000 * 0.8),
      assignedVehicleId: vehicle1.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: ship1.id,
        status: "CREATED",
        title: "E-Way Bill & Shipping Manifest Generated",
        description: "Electronic E-Way Bill EWB-DL-9840129841 registered on GST Portal.",
        location: "Delhi NCR - Alipur Multi-Modal Hub",
        latitude: 28.6139,
        longitude: 77.209,
        source: "MANUAL_DISPATCH",
        eventTimestamp: new Date(Date.now() - 86400000 * 1.2),
      },
      {
        shipmentId: ship1.id,
        status: "PICKED_UP",
        title: "Loaded onto Tata Prima MH-04-GP-8842",
        description: "Driver Gurpreet Singh verified digital FASTag tag and axle load certificates.",
        location: "Delhi NCR - Alipur Dock 6",
        latitude: 28.62,
        longitude: 77.21,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 86400000 * 0.9),
      },
      {
        shipmentId: ship1.id,
        status: "DEPARTED_FACILITY",
        title: "Crossed Kishangarh Toll Plaza (Rajasthan)",
        description: "NH-48 corridor transit speed 66 km/h. FASTag auto-deducted.",
        location: "Kishangarh Toll Plaza, Rajasthan",
        latitude: 26.57,
        longitude: 74.86,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 86400000 * 0.4),
      },
      {
        shipmentId: ship1.id,
        status: "IN_TRANSIT",
        title: "In Transit - Live GPS Telemetry Ping",
        description: "Vehicle traveling at 68 km/h on Bharuch Bypass. Engine telemetry nominal.",
        location: "Bharuch Corridor, Gujarat (NH-48)",
        latitude: 21.7051,
        longitude: 72.9959,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 1.5),
      },
    ],
  });

  // Shipment 2: BLR-DEL-771 (Bengaluru to Delhi - Air Cargo)
  const ship2 = await prisma.shipment.create({
    data: {
      trackingNumber: "BLR-DEL-771",
      externalTrackingNumber: "AWB-SPX-7710921",
      carrier: "SpiceXpress Cargo A321",
      serviceType: "Air Express Domestic Cargo",
      currentStatus: "OUT_FOR_DELIVERY",
      sourceType: "CARRIER_FEED",
      senderName: "Bharat Semiconductor Foundry",
      senderAddress: "Electronic City Phase I",
      senderCity: "Bengaluru",
      senderCountry: "India",
      recipientName: "National Defense Electronics Lab",
      recipientAddress: "Okhla Industrial Area Phase III",
      recipientCity: "Delhi NCR",
      recipientCountry: "India",
      originCity: "Bengaluru",
      originState: "Karnataka",
      originLat: 12.9716,
      originLng: 77.5946,
      destinationCity: "Delhi NCR",
      destinationState: "Delhi",
      destinationLat: 28.6139,
      destinationLng: 77.209,
      currentLat: 28.5562,
      currentLng: 77.1,
      weightKg: 850.0,
      dimensions: "180x120x90 cm",
      packageType: "Cleanroom Semiconductor Crates",
      packageDescription: "Precision Sensor Microchips and Avionics Processors",
      specialInstructions: "Handle with extreme care. Temperature and shock logger attached.",
      estimatedDelivery: new Date(Date.now() + 3600000 * 2),
      assignedVehicleId: vehicle2.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: ship2.id,
        status: "CREATED",
        title: "Airway Bill AWB-SPX-7710921 Issued",
        description: "Cargo screened and palletized for freighter loading.",
        location: "Bengaluru Kempegowda Cargo Terminal",
        latitude: 13.1986,
        longitude: 77.7066,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 8),
      },
      {
        shipmentId: ship2.id,
        status: "IN_TRANSIT",
        title: "Flight A321-P2F In-Transit Flight",
        description: "Freighter cruising at 34,000 ft over Central India corridor.",
        location: "Nagpur Air Traffic Control Sector",
        latitude: 21.1458,
        longitude: 79.0882,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 4),
      },
      {
        shipmentId: ship2.id,
        status: "OUT_FOR_DELIVERY",
        title: "Landed at Delhi IGI Airport - Out for Delivery",
        description: "Dispatched on specialized air-ride electric delivery van to Okhla.",
        location: "Delhi IGI Airport Terminal 3 Cargo Gateway",
        latitude: 28.5562,
        longitude: 77.1,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  // Shipment 3: KOL-CHN-309 (Kolkata to Chennai - Coastal Multi-Modal)
  const ship3 = await prisma.shipment.create({
    data: {
      trackingNumber: "KOL-CHN-309",
      carrier: "Eastern Coastal Container Lines",
      serviceType: "Coastal Freight / NH-16",
      currentStatus: "IN_TRANSIT",
      sourceType: "TELEMATICS_GPS",
      senderName: "Haldia Industrial Petrochem",
      senderAddress: "Syama Prasad Port Complex",
      senderCity: "Kolkata",
      senderCountry: "India",
      recipientName: "Madras Fertilizers & Chemicals",
      recipientAddress: "Ennore Port Logistics Terminal",
      recipientCity: "Chennai",
      recipientCountry: "India",
      originCity: "Kolkata",
      originState: "West Bengal",
      originLat: 22.5726,
      originLng: 88.3639,
      destinationCity: "Chennai",
      destinationState: "Tamil Nadu",
      destinationLat: 13.0827,
      destinationLng: 80.2707,
      currentLat: 17.6868,
      currentLng: 83.2185,
      weightKg: 32000.0,
      dimensions: "40ft ISO Container",
      packageType: "Steel Coils & Industrial Cables",
      packageDescription: "Heavy Galvanized Wire Ropes & Subsea Cable Reels",
      estimatedDelivery: new Date(Date.now() + 86400000 * 1.8),
      assignedVehicleId: vehicle4.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: ship3.id,
        status: "PICKED_UP",
        title: "Container Loaded onto Ashok Leyland AVTR 4220",
        description: "Weighbridge certified 32 metric tons at Haldia dock.",
        location: "Haldia Port Terminal, West Bengal",
        latitude: 22.02,
        longitude: 88.06,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 86400000 * 1.5),
      },
      {
        shipmentId: ship3.id,
        status: "IN_TRANSIT",
        title: "NH-16 Coastal Corridor Transit",
        description: "Vehicle moving at 62 km/h near Visakhapatnam Industrial corridor.",
        location: "Visakhapatnam Bypass, Andhra Pradesh",
        latitude: 17.6868,
        longitude: 83.2185,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 3),
      },
    ],
  });

  // Shipment 4: DEL-BOM-884 (Dadri to JNPT - Western DFC Rail)
  const ship4 = await prisma.shipment.create({
    data: {
      trackingNumber: "DEL-BOM-884",
      carrier: "CONCOR Western Rail DFC",
      serviceType: "Double-Stack Container Express",
      currentStatus: "IN_TRANSIT",
      sourceType: "TELEMATICS_GPS",
      senderName: "Dadri Inland Container Depot",
      senderAddress: "Multi-Modal Logistics Hub",
      senderCity: "Dadri / Delhi NCR",
      senderCountry: "India",
      recipientName: "Jawaharlal Nehru Port Authority",
      recipientAddress: "JNPT Railhead Terminal 1",
      recipientCity: "Mumbai",
      recipientCountry: "India",
      originCity: "Delhi NCR",
      originState: "Uttar Pradesh",
      originLat: 28.6139,
      originLng: 77.209,
      destinationCity: "Mumbai",
      destinationState: "Maharashtra",
      destinationLat: 18.95,
      destinationLng: 72.82,
      currentLat: 25.5,
      currentLng: 73.8,
      weightKg: 1200000.0,
      dimensions: "45 Double-Stack Flatcars",
      packageType: "Export ISO Shipping Containers",
      packageDescription: "Textiles, Engineering Goods and Spices for European Export",
      estimatedDelivery: new Date(Date.now() + 3600000 * 14),
      assignedVehicleId: vehicle2.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: ship4.id,
        status: "CREATED",
        title: "CONCOR Train Rake Assembled",
        description: "45 double-stack container flatcars inspected and cleared.",
        location: "Dadri ICD Terminal, UP",
        latitude: 28.55,
        longitude: 77.55,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 18),
      },
      {
        shipmentId: ship4.id,
        status: "IN_TRANSIT",
        title: "Western DFC High-Speed Rail Corridor",
        description: "WAG-12B Electric Engine running at 78 km/h on dedicated electrified tracks.",
        location: "Marwar Junction Section, Rajasthan DFC",
        latitude: 25.5,
        longitude: 73.8,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  // Shipment 5: NAG-HYD-502 (Nagpur to Hyderabad - Pharma Cold Chain)
  const ship5 = await prisma.shipment.create({
    data: {
      trackingNumber: "NAG-HYD-502",
      carrier: "NEXTRAK Pharma Reefer Logistics",
      serviceType: "Cold Chain (-20°C Deep Freeze)",
      currentStatus: "DELIVERED",
      sourceType: "TELEMATICS_GPS",
      senderName: "Central India Bio-Vaccines Institute",
      senderAddress: "MIHAN SEZ Pharma Park",
      senderCity: "Nagpur",
      senderCountry: "India",
      recipientName: "Hyderabad Genome Valley Logistics",
      recipientAddress: "Shamirpet Biotech Hub",
      recipientCity: "Hyderabad",
      recipientCountry: "India",
      originCity: "Nagpur",
      originState: "Maharashtra",
      originLat: 21.1458,
      originLng: 79.0882,
      destinationCity: "Hyderabad",
      destinationState: "Telangana",
      destinationLat: 17.385,
      destinationLng: 78.4867,
      currentLat: 17.385,
      currentLng: 78.4867,
      weightKg: 4200.0,
      dimensions: "Reefer Container (20ft)",
      packageType: "Cryogenic Vaccines",
      packageDescription: "Temperature-Sensitive mRNA Vaccines (-18.4°C Maintained)",
      estimatedDelivery: new Date(Date.now() - 3600000 * 4),
      actualDelivery: new Date(Date.now() - 3600000 * 3.5),
      assignedVehicleId: vehicle3.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: ship5.id,
        status: "PICKED_UP",
        title: "Cold Chain Loaded at MIHAN SEZ",
        description: "Pre-cooled to -20°C. Temperature sensor datalogger activated.",
        location: "Nagpur MIHAN Special Economic Zone",
        latitude: 21.1458,
        longitude: 79.0882,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 16),
      },
      {
        shipmentId: ship5.id,
        status: "DELIVERED",
        title: "Delivered & Cryogenic Seal Verified",
        description: "Received and signed by Dr. K. Rao. Thermal graph verified: zero excursion.",
        location: "Hyderabad Genome Valley Shamirpet Hub",
        latitude: 17.385,
        longitude: 78.4867,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 3.5),
      },
    ],
  });

  // PharmaOS Consignment 1: VAX-9042-HYD (Cryogenic mRNA Vaccines)
  const vaxShip = await prisma.shipment.create({
    data: {
      trackingNumber: "VAX-9042-HYD",
      externalTrackingNumber: "CDSCO-EWB-TS-90421",
      carrier: "Bharat Biotech National Vaccine Reserve",
      serviceType: "Cryogenic Reefer Highway Express (-20°C)",
      currentStatus: "IN_TRANSIT",
      sourceType: "TELEMATICS_GPS",
      senderName: "Bharat Biotech International Ltd",
      senderAddress: "Genome Valley, Shamirpet",
      senderCity: "Hyderabad",
      senderCountry: "India",
      recipientName: "AIIMS New Delhi Central Medical Reserve",
      recipientAddress: "Ansari Nagar, Sri Aurobindo Marg",
      recipientCity: "Delhi NCR",
      recipientCountry: "India",
      originCity: "Hyderabad",
      originState: "Telangana",
      originLat: 17.385,
      originLng: 78.4867,
      destinationCity: "Delhi NCR",
      destinationState: "Delhi",
      destinationLat: 28.5672,
      destinationLng: 77.2100,
      currentLat: 21.1458,
      currentLng: 79.0882, // Nagpur MIHAN bypass
      weightKg: 4800.0,
      dimensions: "Dedicated Cryo Reefer (Scania P280)",
      packageType: "Cryogenic mRNA Vaccines (-20°C)",
      packageDescription: "12,500 Vials mRNA COVID-19/Flu Bivalent Vaccines (Batch #BB-COV-2026-09)",
      specialInstructions: "CDSCO Form 20B/21B validated. Continuous -20°C cryogenic logging. Zero excursion tolerance.",
      estimatedDelivery: new Date(Date.now() + 3600000 * 20),
      assignedVehicleId: vehicle3.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: vaxShip.id,
        status: "CREATED",
        title: "CDSCO Manifest & Form 20B Verified",
        description: "Electronic CDSCO E-Way Bill CDSCO-EWB-TS-90421 registered with batch release certificate.",
        location: "Hyderabad Genome Valley Hub",
        latitude: 17.385,
        longitude: 78.4867,
        source: "MANUAL_DISPATCH",
        eventTimestamp: new Date(Date.now() - 3600000 * 14),
      },
      {
        shipmentId: vaxShip.id,
        status: "PICKED_UP",
        title: "Loaded onto Scania Cryo Reefer TS-09-CD-9042",
        description: "Driver Rameshwar Rao verified dry ice backup and cryogenic logger (-20.4°C confirmed).",
        location: "Bharat Biotech Dispatch Dock 3",
        latitude: 17.39,
        longitude: 78.49,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 11),
      },
      {
        shipmentId: vaxShip.id,
        status: "IN_TRANSIT",
        title: "In Transit - Adilabad NH-44 Toll Plaza",
        description: "NH-44 corridor transit speed 72 km/h. Sensor telemetry nominal at -20.2°C.",
        location: "Adilabad Checkpost, Telangana/Maharashtra Border",
        latitude: 19.66,
        longitude: 78.53,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 6),
      },
      {
        shipmentId: vaxShip.id,
        status: "IN_TRANSIT",
        title: "Nagpur MIHAN Transshipment Bypass",
        description: "Vehicle traveling at 68 km/h. Live battery-backed IoT logger reports -20.4°C continuous.",
        location: "Nagpur MIHAN Life Sciences Sector, Maharashtra",
        latitude: 21.1458,
        longitude: 79.0882,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 1.5),
      },
    ],
  });

  // PharmaOS Consignment 2: INS-4410-AMD (Recombinant Human Insulin)
  const insShip = await prisma.shipment.create({
    data: {
      trackingNumber: "INS-4410-AMD",
      externalTrackingNumber: "CDSCO-EWB-GJ-44102",
      carrier: "Zydus Biologics Cold-Chain Lifeline",
      serviceType: "Refrigerated Biologics Reefer (+2°C to +8°C)",
      currentStatus: "OUT_FOR_DELIVERY",
      sourceType: "TELEMATICS_GPS",
      senderName: "Zydus Lifesciences Ltd",
      senderAddress: "Changodar Biotech Industrial Park",
      senderCity: "Ahmedabad",
      senderCountry: "India",
      recipientName: "KEM Hospital Central Pharmacy",
      recipientAddress: "Acharya Donde Marg, Parel",
      recipientCity: "Mumbai",
      recipientCountry: "India",
      originCity: "Ahmedabad",
      originState: "Gujarat",
      originLat: 23.0225,
      originLng: 72.5714,
      destinationCity: "Mumbai",
      destinationState: "Maharashtra",
      destinationLat: 19.0028,
      destinationLng: 72.8423,
      currentLat: 19.1982,
      currentLng: 72.9632, // Thane West
      weightKg: 3100.0,
      dimensions: "BharatBenz 1217C Insulated Reefer",
      packageType: "Recombinant Human Insulin (+2°C to +8°C)",
      packageDescription: "18,000 Cartridges Recombinant Human Insulin (Batch #ZY-INS-441)",
      specialInstructions: "Maintain +2°C to +8°C strictly. Continuous USB/BLE data logging required.",
      estimatedDelivery: new Date(Date.now() + 3600000 * 3),
      assignedVehicleId: vehicle1.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: insShip.id,
        status: "CREATED",
        title: "Batch QC Released & E-Way Bill Issued",
        description: "Certified by CDSCO Inspectorate. EWB CDSCO-EWB-GJ-44102 registered.",
        location: "Zydus Changodar SEZ, Gujarat",
        latitude: 23.0225,
        longitude: 72.5714,
        source: "MANUAL_DISPATCH",
        eventTimestamp: new Date(Date.now() - 3600000 * 10),
      },
      {
        shipmentId: insShip.id,
        status: "IN_TRANSIT",
        title: "Surat Hazira Inspection (Temp +4.2°C)",
        description: "NH-48 corridor weighbridge check completed with stable internal temp +4.2°C.",
        location: "Surat NH-48 Checkpost, Gujarat",
        latitude: 21.1702,
        longitude: 72.8311,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 5),
      },
      {
        shipmentId: insShip.id,
        status: "OUT_FOR_DELIVERY",
        title: "Out for Last-Mile Hospital Delivery",
        description: "Vehicle reached Thane West Toll Plaza. Entering Mumbai municipal boundaries.",
        location: "Thane West Expressway, Maharashtra",
        latitude: 19.1982,
        longitude: 72.9632,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  // PharmaOS Consignment 3: ONC-8840-PUN (Serum Biologics DFC Rail)
  const oncShip = await prisma.shipment.create({
    data: {
      trackingNumber: "ONC-8840-PUN",
      externalTrackingNumber: "CDSCO-EWB-MH-88403",
      carrier: "Serum Institute WDFC Reefer Express",
      serviceType: "WDFC Reefer Rake Railhead (Twin Genset)",
      currentStatus: "IN_TRANSIT",
      sourceType: "TELEMATICS_GPS",
      senderName: "Serum Institute of India Pvt Ltd",
      senderAddress: "Hadapsar / Chakan Campus",
      senderCity: "Pune",
      senderCountry: "India",
      recipientName: "Jawaharlal Nehru Port Authority Cold Port",
      recipientAddress: "Berth 4 Marine Reefer Terminal",
      recipientCity: "Mumbai",
      recipientCountry: "India",
      originCity: "Pune",
      originState: "Maharashtra",
      originLat: 18.5204,
      originLng: 73.8567,
      destinationCity: "Mumbai",
      destinationState: "Maharashtra",
      destinationLat: 18.9500,
      destinationLng: 72.9500,
      currentLat: 18.7500,
      currentLng: 73.3000, // Western Ghats Bhor Ghat section
      weightKg: 25000.0,
      dimensions: "CONCOR Reefer Rake (45 ISO Containers)",
      packageType: "Serum Monoclonal Antibodies (-22°C)",
      packageDescription: "25 MT Monoclonal Antibodies & Pediatric Vaccines (Batch #SII-ONC-884)",
      specialInstructions: "WDFC Reefer Rake operating with twin backup diesel gensets. Monitored continuously.",
      estimatedDelivery: new Date(Date.now() + 3600000 * 6),
      assignedVehicleId: vehicle2.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: oncShip.id,
        status: "CREATED",
        title: "Serum Institute Cold Vault Loading",
        description: "Dry ice pre-pack complete. Thermal sensor loggers calibrated at -22°C.",
        location: "Serum Institute Hadapsar Campus, Pune",
        latitude: 18.5204,
        longitude: 73.8567,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 8),
      },
      {
        shipmentId: oncShip.id,
        status: "IN_TRANSIT",
        title: "Talegaon Reefer Siding Handover to WDFC",
        description: "Rake transferred to CONCOR electric locomotive WAG-12B #60104.",
        location: "Talegaon Freight Yard, Maharashtra",
        latitude: 18.7300,
        longitude: 73.6800,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 4),
      },
      {
        shipmentId: oncShip.id,
        status: "IN_TRANSIT",
        title: "High-Speed Rail Transit - Bhor Ghat DFC Feeder",
        description: "Loco running at 76 km/h. Genset 1 and Genset 2 nominal. Temperature -22.1°C.",
        location: "Bhor Ghat Section, Western Corridor",
        latitude: 18.7500,
        longitude: 73.3000,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 1.2),
      },
    ],
  });

  // PharmaOS Consignment 4: PLS-3091-DEL (Emergency Plasma Air Lifeline)
  const plsShip = await prisma.shipment.create({
    data: {
      trackingNumber: "PLS-3091-DEL",
      externalTrackingNumber: "CDSCO-AWB-AI-30914",
      carrier: "Air India Cargo Critical Medical Lifeline",
      serviceType: "Emergency Medical Air Cargo Express",
      currentStatus: "IN_TRANSIT",
      sourceType: "CARRIER_FEED",
      senderName: "AIIMS New Delhi Blood Transfusion Center",
      senderAddress: "Ansari Nagar East",
      senderCity: "Delhi NCR",
      senderCountry: "India",
      recipientName: "Apollo Multispecialty Hospital Kolkata",
      recipientAddress: "58 Canal Circular Road, Salt Lake",
      recipientCity: "Kolkata",
      recipientCountry: "India",
      originCity: "Delhi NCR",
      originState: "Delhi",
      originLat: 28.5562,
      originLng: 77.1000,
      destinationCity: "Kolkata",
      destinationState: "West Bengal",
      destinationLat: 22.5726,
      destinationLng: 88.3639,
      currentLat: 25.3176,
      currentLng: 82.9739, // Varanasi airspace cruising FL350
      weightKg: 450.0,
      dimensions: "Cryo Dry Ice Pods (Air Transport Certified)",
      packageType: "Emergency Blood Plasma Air Lifeline (-30°C)",
      packageDescription: "450 kg Convalescent Blood Plasma & Cryoprecipitate Units (Batch #AIIMS-PLS-309)",
      specialInstructions: "Priority CDSCO Life-Saving Cargo. Green corridor priority at Kolkata Airport.",
      estimatedDelivery: new Date(Date.now() + 3600000 * 3.5),
      assignedVehicleId: vehicle2.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: plsShip.id,
        status: "CREATED",
        title: "CDSCO Emergency Air Transport Order Issued",
        description: "AIIMS Blood Transfusion Center released cryo pods for urgent cardiac surgery.",
        location: "Delhi AIIMS Blood Bank Vault",
        latitude: 28.5672,
        longitude: 77.2100,
        source: "MANUAL_DISPATCH",
        eventTimestamp: new Date(Date.now() - 3600000 * 5),
      },
      {
        shipmentId: plsShip.id,
        status: "PICKED_UP",
        title: "IGI Coolport Apron Loading Complete",
        description: "Loaded into temperature-controlled cargo hold of Airbus A320neo VT-EXC.",
        location: "Delhi IGI Airport Terminal 3 Coolport",
        latitude: 28.5562,
        longitude: 77.1000,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 2.5),
      },
      {
        shipmentId: plsShip.id,
        status: "IN_TRANSIT",
        title: "Cruising FL350 over Varanasi Enroute Kolkata",
        description: "Air freight at 840 km/h groundspeed. Cryo telemetry stable at -30.5°C.",
        location: "Varanasi Airspace Sector, Uttar Pradesh",
        latitude: 25.3176,
        longitude: 82.9739,
        source: "CARRIER_SCAN",
        eventTimestamp: new Date(Date.now() - 3600000 * 0.8),
      },
    ],
  });

  // PharmaOS Consignment 5: BIO-5020-BLR (Monoclonal Antibodies)
  const bioShip = await prisma.shipment.create({
    data: {
      trackingNumber: "BIO-5020-BLR",
      externalTrackingNumber: "CDSCO-EWB-KA-50205",
      carrier: "Biocon Biologics Smart Reefer",
      serviceType: "Insulated Smart-Reefer Highway Van (+2°C to +8°C)",
      currentStatus: "DELIVERED",
      sourceType: "TELEMATICS_GPS",
      senderName: "Biocon Biologics Ltd",
      senderAddress: "Biocon Park, Electronic City Phase II",
      senderCity: "Bengaluru",
      senderCountry: "India",
      recipientName: "Apollo Health City Jubilee Hills",
      recipientAddress: "Road No 72, Film Nagar",
      recipientCity: "Hyderabad",
      recipientCountry: "India",
      originCity: "Bengaluru",
      originState: "Karnataka",
      originLat: 12.9716,
      originLng: 77.5946,
      destinationCity: "Hyderabad",
      destinationState: "Telangana",
      destinationLat: 17.4200,
      destinationLng: 78.4100,
      currentLat: 17.4200,
      currentLng: 78.4100,
      weightKg: 3400.0,
      dimensions: "Volvo FE Electric Smart Reefer",
      packageType: "Biosimilar Oncology Infusions (+4°C)",
      packageDescription: "3.4 MT Trastuzumab Biosimilar Oncology Infusions (Batch #BCN-BIO-502)",
      specialInstructions: "Zero-Excursion CDSCO GDP Protocol. Target +4°C continuously.",
      estimatedDelivery: new Date(Date.now() - 3600000 * 2),
      actualDelivery: new Date(Date.now() - 3600000 * 1.5),
      assignedVehicleId: vehicle3.id,
    },
  });

  await prisma.trackingEvent.createMany({
    data: [
      {
        shipmentId: bioShip.id,
        status: "PICKED_UP",
        title: "Cold Pallet Loading at Biocon Facility 4",
        description: "Reefer pre-conditioned to +3.8°C. Data logger active.",
        location: "Biocon Park, Electronic City, Bengaluru",
        latitude: 12.84,
        longitude: 77.67,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 12),
      },
      {
        shipmentId: bioShip.id,
        status: "IN_TRANSIT",
        title: "Anantapur NH-44 Telemetry Checkpoint",
        description: "Highway cruise speed 64 km/h. Temperature +4.0°C intact.",
        location: "Anantapur Checkpost, Andhra Pradesh",
        latitude: 14.68,
        longitude: 77.60,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 6),
      },
      {
        shipmentId: bioShip.id,
        status: "DELIVERED",
        title: "Receipt Verified & Stored at Apollo Health City",
        description: "Delivered to Central Oncology Cold Vault. Received by Chief Pharmacist. Temp +3.9°C verified.",
        location: "Apollo Health City Jubilee Hills, Hyderabad",
        latitude: 17.42,
        longitude: 78.41,
        source: "TELEMATICS_GPS",
        eventTimestamp: new Date(Date.now() - 3600000 * 1.5),
      },
    ],
  });

  // 5. Create Routes and Stops (Indian Corridors)
  const route1 = await prisma.route.create({
    data: {
      routeNumber: "RT-DEL-MUM-GQ01",
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      startLocation: "Delhi NCR - Alipur Multimodal Hub",
      destination: "Mumbai / JNPT Container Port Terminal 2",
      startLat: 28.6139,
      startLng: 77.209,
      destLat: 18.95,
      destLng: 72.82,
      totalDistanceKm: 1410.0,
      estimatedDuration: "24 hrs 15 mins",
      status: "IN_PROGRESS",
      optimizationType: "MULTI_STOP_TSP",
    },
  });

  await prisma.routeStop.createMany({
    data: [
      {
        routeId: route1.id,
        address: "Jaipur Freight Hub, Rajasthan",
        latitude: 26.9124,
        longitude: 75.7873,
        stopOrder: 1,
        deliveryStatus: "COMPLETED",
        notes: "Dropped 4 pallets auto glass",
      },
      {
        routeId: route1.id,
        address: "Ahmedabad Western Terminal, Gujarat",
        latitude: 23.0225,
        longitude: 72.5714,
        stopOrder: 2,
        deliveryStatus: "PENDING",
        notes: "FASTag toll bypass cleared",
      },
      {
        routeId: route1.id,
        address: "Mumbai JNPT Gate 4, Maharashtra",
        latitude: 18.95,
        longitude: 72.82,
        stopOrder: 3,
        deliveryStatus: "PENDING",
        notes: "Final export container offload",
      },
    ],
  });

  // 6. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: superAdmin.id,
        title: "Highway Congestion Alert: NH-48 Bharuch",
        message: "Minor bridge congestion on NH-48 (+18 mins delay). Dynamic re-routing active for vehicle MH-04-GP-8842.",
        type: "DELAY",
        isRead: false,
        linkUrl: "/dashboard/routes",
      },
      {
        userId: superAdmin.id,
        title: "Air Cargo Landed: BLR-DEL-771",
        message: "A321 freighter landed at Delhi IGI Airport. Out for last-mile delivery to Okhla.",
        type: "DELIVERED",
        isRead: true,
        linkUrl: "/track/BLR-DEL-771",
      },
      {
        userId: dispatcher.id,
        title: "Western DFC Rail Rake Dispatched: DEL-BOM-884",
        message: "CONCOR 45 double-stack container rake departed Rewari Junction at 78 km/h.",
        type: "VEHICLE_ASSIGNMENT",
        isRead: false,
        linkUrl: "/dashboard/fleet",
      },
      {
        userId: customerUser.id,
        title: "Cryogenic Vaccines Delivered: NAG-HYD-502",
        message: "Your shipment has arrived at Genome Valley Hyderabad. Temperature logged -18.4°C intact.",
        type: "DELIVERED",
        isRead: false,
        linkUrl: "/track/NAG-HYD-502",
      },
    ],
  });

  // 7. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        action: "CREATE_SHIPMENT",
        resourceType: "Shipment",
        resourceId: ship1.id,
        details: "Created Golden Quadrilateral consignment IND-9042-MUM with FASTag telematics.",
      },
      {
        userId: dispatcher.id,
        action: "ASSIGN_DRIVER",
        resourceType: "Vehicle",
        resourceId: vehicle1.id,
        details: "Assigned Gurpreet Singh to Tata Prima MH-04-GP-8842.",
      },
      {
        userId: dispatcher.id,
        action: "OPTIMIZE_ROUTE",
        resourceType: "Route",
        resourceId: route1.id,
        details: "Generated Delhi-Mumbai NH-48 TSP corridor route with 16.5% transit time reduction.",
      },
    ],
  });

  console.log("✅ NEXTRAK India Database successfully seeded with operational records!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

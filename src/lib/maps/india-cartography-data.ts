/**
 * Official Sovereign India Cartographic Datasets
 * Modeled after iamaware.in/map and Survey of India / DataMeet sovereign boundary standards.
 *
 * Layers included:
 * 1. Sovereign India External Boundary & State/UT Polygons (Accurate J&K, Ladakh, Arunachal, Islands)
 * 2. Key Logistics Districts
 * 3. Physical & Geography: Major Rivers (NW-1, NW-2, Godavari, Krishna, Narmada)
 * 4. Mountain Passes & Strategic Ghat Bottlenecks (Kasara, Bhor, Rohtang, Zoji La, Nathu La, Siliguri Corridor)
 * 5. Major Seaports & Inland Container Depots (JNPT, Mundra, Chennai, Vizag, Cochin, Haldia, ICD TKD)
 * 6. Logistics Corridors: Golden Quadrilateral, NS-EW, Western DFC & Eastern DFC Rail
 * 7. FASTag Toll Plazas
 * 8. Live Shipment Telemetry Fleet
 */

export interface GeoFeature {
  type: "Feature";
  id: string | number;
  properties: Record<string, any>;
  geometry: {
    type: "Polygon" | "MultiPolygon" | "LineString" | "MultiLineString" | "Point";
    coordinates: any;
  };
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

// 1. Sovereign India External Boundary Outline (DataMeet & SOI compliant)
export const INDIA_SOVEREIGN_OUTLINE: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "india-sovereign-border",
      properties: {
        name: "Republic of India",
        territory: "Sovereign Territory of India",
        jurisdiction: "Survey of India / DataMeet Compliant",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            // Northern Ladakh & Karakoram
            [77.0, 35.5], [77.8, 35.6], [78.6, 35.4], [79.2, 35.0], [79.5, 34.3],
            [79.3, 33.5], [78.9, 32.8], [78.6, 32.0], [79.5, 31.4], [80.3, 30.8],
            [80.9, 30.2], [81.0, 29.8],
            // Nepal Border (Uttarakhand, UP, Bihar, WB, Sikkim)
            [80.1, 28.8], [81.3, 28.2], [82.6, 27.7], [84.1, 27.2], [85.5, 26.8],
            [87.0, 26.5], [88.1, 26.8], [88.2, 27.8], [88.9, 28.0], [88.9, 27.2],
            // Bhutan Border & Arunachal Pradesh (Tawang, Siang, Dibang)
            [89.7, 27.3], [91.5, 27.5], [92.1, 27.8], [93.5, 28.6], [94.8, 29.0],
            [96.0, 29.5], [97.4, 28.3], [97.0, 27.5], [96.2, 26.8],
            // Myanmar Border (Nagaland, Manipur, Mizoram)
            [95.2, 25.8], [94.5, 24.5], [93.5, 23.8], [93.2, 22.5], [92.8, 21.8],
            // Bangladesh Border (Mizoram, Tripura, Meghalaya, West Bengal)
            [92.3, 22.0], [91.8, 23.0], [92.2, 24.2], [91.5, 25.2], [89.8, 25.3],
            [89.0, 26.2], [88.2, 26.0], [88.5, 24.8], [89.0, 23.5], [89.1, 22.0],
            // Bay of Bengal Coastline (Sundarbans to Kanyakumari)
            [88.3, 21.6], [87.1, 21.3], [86.5, 20.3], [85.0, 19.3], [83.3, 17.7],
            [82.2, 16.8], [80.3, 15.9], [80.2, 13.5], [79.8, 11.9], [79.9, 10.3],
            [79.0, 9.3], [77.8, 8.5], [77.55, 8.08], // Kanyakumari Tip
            // Arabian Sea Coastline (Kanyakumari to Gujarat)
            [76.6, 8.8], [76.2, 9.9], [75.8, 11.2], [74.9, 12.8], [74.1, 14.2],
            [73.8, 15.5], [73.2, 16.9], [72.82, 18.95], // Mumbai Coast
            [72.8, 19.8], [72.7, 21.1], [72.2, 21.6], [71.0, 20.8], [69.5, 22.2],
            [69.0, 22.8], [68.5, 23.5], [68.2, 24.0], // Kori Creek / Kutch
            // Western Pakistan Border (Rajasthan, Punjab, J&K, Ladakh)
            [70.5, 24.8], [70.9, 26.2], [70.4, 27.1], [71.8, 28.2], [72.5, 29.4],
            [73.8, 30.5], [74.8, 31.8], [74.5, 32.5], [74.3, 33.6], [74.8, 34.5],
            [75.8, 35.2], [77.0, 35.5]
          ]
        ]
      }
    }
  ]
};

// 2. States and Union Territories (Sovereign Boundaries & Telemetry)
export const INDIA_STATES_DATA: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "state-dl",
      properties: {
        name: "Delhi (NCT)",
        code: "DL",
        capital: "New Delhi",
        region: "Northern Corridor",
        hubStatus: "National Logistics Command Center",
        activeConsignments: 1420,
        avgSpeed: "48 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[76.85, 28.40], [77.35, 28.40], [77.35, 28.88], [76.85, 28.88], [76.85, 28.40]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-mh",
      properties: {
        name: "Maharashtra",
        code: "MH",
        capital: "Mumbai",
        region: "Western Industrial & Maritime",
        hubStatus: "JNPT Gateway & Nhava Sheva Hub",
        activeConsignments: 2840,
        avgSpeed: "62 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[72.6, 18.5], [73.8, 15.6], [76.0, 16.5], [80.5, 18.5], [80.8, 21.5], [76.5, 21.8], [72.8, 20.2], [72.6, 18.5]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-ka",
      properties: {
        name: "Karnataka",
        code: "KA",
        capital: "Bengaluru",
        region: "Southern Tech Corridor",
        hubStatus: "Air Cargo & High-Tech Distribution",
        activeConsignments: 1980,
        avgSpeed: "58 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[74.1, 14.2], [74.8, 12.8], [76.8, 11.8], [78.4, 13.5], [77.6, 16.2], [75.2, 17.0], [74.1, 14.2]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-tn",
      properties: {
        name: "Tamil Nadu",
        code: "TN",
        capital: "Chennai",
        region: "South-Eastern Maritime",
        hubStatus: "Chennai Port & Auto Cluster",
        activeConsignments: 1750,
        avgSpeed: "64 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[77.55, 8.08], [79.2, 9.3], [80.2, 13.5], [78.6, 13.2], [76.9, 11.6], [76.6, 8.8], [77.55, 8.08]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-gj",
      properties: {
        name: "Gujarat",
        code: "GJ",
        capital: "Gandhinagar",
        region: "Western Freight Corridor",
        hubStatus: "Mundra Port & Petrochemical Corridor",
        activeConsignments: 2310,
        avgSpeed: "68 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[68.2, 24.0], [71.2, 24.5], [73.5, 23.5], [73.2, 21.0], [72.7, 21.1], [70.8, 20.7], [68.9, 22.4], [68.2, 24.0]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-wb",
      properties: {
        name: "West Bengal",
        code: "WB",
        capital: "Kolkata",
        region: "Eastern Corridor & Gateway",
        hubStatus: "Haldia Port & Siliguri Transit",
        activeConsignments: 1390,
        avgSpeed: "54 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[86.5, 22.0], [88.5, 21.6], [89.0, 23.8], [88.2, 26.2], [87.8, 24.8], [86.5, 22.0]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-ts",
      properties: {
        name: "Telangana",
        code: "TS",
        capital: "Hyderabad",
        region: "South-Central Hub",
        hubStatus: "Genome Valley Pharma Distribution",
        activeConsignments: 1140,
        avgSpeed: "61 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[77.5, 16.0], [80.2, 16.8], [80.8, 18.5], [78.2, 19.5], [77.5, 17.5], [77.5, 16.0]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-rj",
      properties: {
        name: "Rajasthan",
        code: "RJ",
        capital: "Jaipur",
        region: "Northern Freight Belt",
        hubStatus: "Western DFC Logistics Backbone",
        activeConsignments: 1580,
        avgSpeed: "67 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[70.5, 24.8], [74.5, 24.0], [76.8, 27.2], [74.8, 28.5], [71.8, 28.2], [70.4, 27.1], [70.5, 24.8]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-as",
      properties: {
        name: "Assam",
        code: "AS",
        capital: "Dispur (Guwahati)",
        region: "North-Eastern Corridor",
        hubStatus: "Brahmaputra NW-2 & NE Gateway",
        activeConsignments: 620,
        avgSpeed: "45 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[89.8, 26.2], [92.5, 26.1], [95.2, 27.5], [94.5, 26.0], [91.5, 25.8], [89.8, 26.2]]
        ]
      }
    },
    {
      type: "Feature",
      id: "state-jk-la",
      properties: {
        name: "Jammu & Kashmir / Ladakh",
        code: "UT-JK-LA",
        capital: "Srinagar / Leh",
        region: "Trans-Himalayan Security & Strategic Corridor",
        hubStatus: "NH-44 Zero Origin & High Altitude Cold Chain",
        activeConsignments: 410,
        avgSpeed: "38 km/h",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[74.2, 32.8], [76.5, 32.5], [79.2, 35.0], [77.8, 35.6], [75.0, 34.6], [74.2, 32.8]]
        ]
      }
    }
  ]
};

// 3. Physical & Geography: Major Rivers & Inland Waterways
export const INDIA_RIVERS_DATA: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "river-ganga",
      properties: {
        name: "Ganga River (National Waterway 1)",
        lengthKm: "2,525 km",
        corridor: "Prayagraj - Varanasi - Patna - Haldia Dock",
        vesselDraft: "2.8 - 3.2 m",
        trafficType: "Multi-modal Inland Barge Freight",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [78.5, 30.1], [79.2, 28.5], [80.3, 26.8], [81.8, 25.4], [83.0, 25.3],
          [85.1, 25.6], [87.5, 25.3], [88.1, 24.2], [88.35, 22.57], [88.1, 21.9]
        ]
      }
    },
    {
      type: "Feature",
      id: "river-brahmaputra",
      properties: {
        name: "Brahmaputra River (National Waterway 2)",
        lengthKm: "891 km (Indian Stretch)",
        corridor: "Sadiya - Dibrugarh - Tezpur - Guwahati - Dhubri",
        vesselDraft: "2.0 - 2.5 m",
        trafficType: "Heavy Cargo Ro-Ro & Tea Freight",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [95.5, 27.9], [94.8, 27.4], [92.8, 26.6], [91.75, 26.18], [90.5, 26.1], [89.9, 25.8]
        ]
      }
    },
    {
      type: "Feature",
      id: "river-godavari",
      properties: {
        name: "Godavari River (Dakshin Ganga)",
        lengthKm: "1,465 km",
        corridor: "Nashik - Nanded - Rajahmundry",
        trafficType: "South-Central Drainage Basin",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [73.8, 19.9], [75.2, 19.5], [77.3, 19.1], [79.9, 18.8], [81.8, 17.0], [82.2, 16.7]
        ]
      }
    },
    {
      type: "Feature",
      id: "river-narmada",
      properties: {
        name: "Narmada River",
        lengthKm: "1,312 km",
        corridor: "Amarkantak - Jabalpur - Bharuch Gulf of Khambhat",
        trafficType: "Western Industrial Riverway",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [81.7, 22.6], [79.9, 23.1], [77.2, 22.7], [74.8, 22.1], [73.0, 21.7], [72.6, 21.6]
        ]
      }
    }
  ]
};

// 4. Strategic Mountain Passes & Ghat Bottlenecks
export const INDIA_PASSES_AND_GHATS: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "ghat-kasara",
      properties: {
        name: "Kasara Ghat (Thal Ghat)",
        type: "Ghat Freight Bottleneck",
        elevation: "585 m",
        corridor: "NH-160 / Central Railway (Mumbai - Nashik)",
        transitDelayIndex: "18% gradient incline, multi-axle brake check required",
      },
      geometry: {
        type: "Point",
        coordinates: [73.4833, 19.7000]
      }
    },
    {
      type: "Feature",
      id: "ghat-bhor",
      properties: {
        name: "Bhor Ghat (Khandala Incline)",
        type: "Expressway Incline Bottleneck",
        elevation: "610 m",
        corridor: "Mumbai-Pune Expressway / NH-48",
        transitDelayIndex: "High volume, avg speed 35 km/h for heavy trucks",
      },
      geometry: {
        type: "Point",
        coordinates: [73.3667, 18.7500]
      }
    },
    {
      type: "Feature",
      id: "pass-siliguri",
      properties: {
        name: "Siliguri Corridor (Chicken's Neck)",
        type: "Strategic Land Bridge Gateway",
        elevation: "122 m",
        corridor: "NH-27 / Northeast Frontier Railway",
        transitDelayIndex: "Only surface freight link to 8 North-Eastern states",
      },
      geometry: {
        type: "Point",
        coordinates: [88.4312, 26.7271]
      }
    },
    {
      type: "Feature",
      id: "pass-zojila",
      properties: {
        name: "Zoji La Pass",
        type: "High-Altitude Himalayan Pass",
        elevation: "3,528 m",
        corridor: "NH-1 (Srinagar - Kargil - Leh)",
        transitDelayIndex: "Zoji La Tunnel under active execution",
      },
      geometry: {
        type: "Point",
        coordinates: [75.8042, 34.2800]
      }
    },
    {
      type: "Feature",
      id: "pass-rohtang",
      properties: {
        name: "Rohtang / Atal Tunnel",
        type: "All-Weather Himalayan Highway",
        elevation: "3,100 m",
        corridor: "NH-3 (Manali - Leh)",
        transitDelayIndex: "9.02 km tunnel, hazardous cargo escort required",
      },
      geometry: {
        type: "Point",
        coordinates: [77.1700, 32.3600]
      }
    },
    {
      type: "Feature",
      id: "pass-nathula",
      properties: {
        name: "Nathu La Pass",
        type: "Strategic Border Trading Post",
        elevation: "4,310 m",
        corridor: "Old Silk Route, Sikkim",
        transitDelayIndex: "Restricted military & customs clearance only",
      },
      geometry: {
        type: "Point",
        coordinates: [88.9167, 27.3833]
      }
    }
  ]
};

// 5. Major Seaports & Inland Container Depots (ICDs)
export const INDIA_PORTS_AND_ICDS: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "port-jnpt",
      properties: {
        name: "JNPT / Nhava Sheva Port",
        code: "INJNP",
        type: "Premier Maritime Container Gateway",
        capacityTeu: "7.6 Million TEUs",
        berths: 5,
        status: "Berthing Nominal (Turnaround 18.2 hrs)",
      },
      geometry: {
        type: "Point",
        coordinates: [72.9500, 18.9500]
      }
    },
    {
      type: "Feature",
      id: "port-mundra",
      properties: {
        name: "Mundra Port (APSEZ)",
        code: "INMUN",
        type: "Largest Private Commercial Port",
        capacityTeu: "6.8 Million TEUs",
        berths: 10,
        status: "Full DFC Rail Connectivity Operational",
      },
      geometry: {
        type: "Point",
        coordinates: [69.7000, 22.7500]
      }
    },
    {
      type: "Feature",
      id: "port-chennai",
      properties: {
        name: "Chennai Port (ChPA)",
        code: "INMAA",
        type: "South-Eastern Container Hub",
        capacityTeu: "2.5 Million TEUs",
        berths: 4,
        status: "Automotive Roll-on/Roll-off Hub",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2974, 13.0843]
      }
    },
    {
      type: "Feature",
      id: "port-haldia",
      properties: {
        name: "Haldia Dock Complex (SMP Kolkata)",
        code: "INHLD",
        type: "Eastern Riverine Maritime Port",
        capacityTeu: "1.2 Million TEUs",
        berths: 6,
        status: "Tidal Lock System Operational",
      },
      geometry: {
        type: "Point",
        coordinates: [88.0867, 22.0253]
      }
    },
    {
      type: "Feature",
      id: "port-cochin",
      properties: {
        name: "Cochin International Container Terminal (ICTT)",
        code: "INCOK",
        type: "Deepwater Transshipment Hub",
        capacityTeu: "1.0 Million TEUs",
        berths: 2,
        status: "International Shipping Channel Nominal",
      },
      geometry: {
        type: "Point",
        coordinates: [76.2673, 9.9312]
      }
    },
    {
      type: "Feature",
      id: "icd-tughlakabad",
      properties: {
        name: "ICD Tughlakabad (TKD Delhi)",
        code: "INTKD",
        type: "Largest Inland Container Depot (Dry Port)",
        capacityTeu: "450,000 TEUs",
        berths: 0,
        status: "Direct CONCOR DFC Railhead Clearance",
      },
      geometry: {
        type: "Point",
        coordinates: [77.2800, 28.5000]
      }
    }
  ]
};

// 6. National Corridors: Golden Quadrilateral & DFC Rail
export const INDIA_CORRIDORS_DATA: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "corridor-gq-delhi-mumbai",
      properties: {
        name: "Golden Quadrilateral: Delhi → Mumbai (NH-48)",
        mode: "Express Road Fleet",
        lengthKm: "1,419 km",
        activeTrucks: 480,
        status: "High Flow, 64 km/h",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2090, 28.6139], [75.8267, 26.9124], [73.8567, 24.5854],
          [72.5714, 23.0225], [73.1812, 22.3072], [72.9959, 21.7051],
          [72.8200, 18.9500]
        ]
      }
    },
    {
      type: "Feature",
      id: "corridor-gq-mumbai-chennai",
      properties: {
        name: "Golden Quadrilateral: Mumbai → Chennai (NH-48)",
        mode: "Express Road Fleet",
        lengthKm: "1,290 km",
        activeTrucks: 360,
        status: "Smooth, 66 km/h",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [72.8200, 18.9500], [73.8567, 18.5204], [74.2433, 16.7050],
          [75.1240, 15.3647], [77.5946, 12.9716], [80.2707, 13.0827]
        ]
      }
    },
    {
      type: "Feature",
      id: "corridor-gq-chennai-kolkata",
      properties: {
        name: "Golden Quadrilateral: Chennai → Kolkata (NH-16)",
        mode: "Coastal Road Fleet",
        lengthKm: "1,684 km",
        activeTrucks: 290,
        status: "Moderate, 62 km/h",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2707, 13.0827], [80.6480, 16.5062], [83.2185, 17.6868],
          [85.8245, 20.2961], [88.3639, 22.5726]
        ]
      }
    },
    {
      type: "Feature",
      id: "corridor-gq-kolkata-delhi",
      properties: {
        name: "Golden Quadrilateral: Kolkata → Delhi (NH-19)",
        mode: "Grand Trunk Road Fleet",
        lengthKm: "1,453 km",
        activeTrucks: 410,
        status: "High Density, 58 km/h",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [88.3639, 22.5726], [86.9746, 23.6889], [85.3096, 23.3441],
          [83.0076, 25.3176], [80.3319, 26.4499], [78.0081, 27.1767],
          [77.2090, 28.6139]
        ]
      }
    },
    {
      type: "Feature",
      id: "corridor-wdfc-rail",
      properties: {
        name: "Western Dedicated Freight Corridor (WDFC)",
        mode: "Electric Heavy-Haul Rail",
        lengthKm: "1,504 km",
        trainSpeed: "95 - 100 km/h",
        status: "Double-Stack High Rise Catenary Active",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.5500, 28.5300], [76.6200, 28.1800], [75.8000, 26.8500],
          [74.2000, 24.8800], [72.4300, 24.1700], [72.9500, 18.9500]
        ]
      }
    },
    {
      type: "Feature",
      id: "corridor-edfc-rail",
      properties: {
        name: "Eastern Dedicated Freight Corridor (EDFC)",
        mode: "Electrified Coal & Heavy Freight Rail",
        lengthKm: "1,875 km",
        trainSpeed: "85 - 90 km/h",
        status: "Ludhiana to Sonnagar Fully Commissioned",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [75.8500, 30.9000], [76.9000, 29.8000], [77.8000, 28.2000],
          [80.3000, 26.4500], [83.0000, 25.3000], [84.3000, 24.8000],
          [88.2500, 22.6800]
        ]
      }
    }
  ]
};

// 7. Live Telemetry Shipments & Vehicle Fleet Markers
export const INDIA_FLEET_DATA: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "fleet-IND-9042-MUM",
      properties: {
        trackingId: "IND-9042-MUM",
        vehicleReg: "MH-04-GP-8842",
        vehicleModel: "Tata Prima 5530.S Euro VI",
        driver: "Gurpreet Singh",
        origin: "Delhi NCR",
        destination: "Mumbai JNPT Port",
        status: "IN_TRANSIT",
        speed: "68 km/h",
        heading: 205,
        temperature: "Ambient (31°C)",
        eWayBill: "EWB-DL-9840129841",
        cargo: "Precision Engine Transmissions (40 Crates)",
        eta: "14h 20m",
      },
      geometry: {
        type: "Point",
        coordinates: [72.9959, 21.7051] // Bharuch Corridor, Gujarat
      }
    },
    {
      type: "Feature",
      id: "fleet-BLR-DEL-771",
      properties: {
        trackingId: "BLR-DEL-771",
        vehicleReg: "VT-BDE-737F",
        vehicleModel: "Boeing 737-800BCF Air Cargo",
        driver: "Capt. Ananya Sen",
        origin: "Bengaluru Kempegowda",
        destination: "Delhi IGI Air Cargo",
        status: "IN_TRANSIT",
        speed: "740 km/h",
        heading: 355,
        temperature: "Cargo Bay 18°C",
        eWayBill: "EWB-KA-2910481239",
        cargo: "High-Density Semiconductor Wafers",
        eta: "1h 45m",
      },
      geometry: {
        type: "Point",
        coordinates: [77.5946, 17.5000] // Air corridor over Telangana
      }
    },
    {
      type: "Feature",
      id: "fleet-KOL-CHN-309",
      properties: {
        trackingId: "KOL-CHN-309",
        vehicleReg: "IMO-9821401",
        vehicleModel: "MV Shravan Coastal Container",
        driver: "Master Capt. K. Sundaram",
        origin: "Kolkata Haldia Dock",
        destination: "Chennai Port",
        status: "DELIVERED",
        speed: "16.5 knots",
        heading: 195,
        temperature: "Dry Cargo (28°C)",
        eWayBill: "EWB-WB-8830192841",
        cargo: "Heavy Finished Steel Coils & Plates",
        eta: "Arrived at Berth 3",
      },
      geometry: {
        type: "Point",
        coordinates: [80.2974, 13.0843] // Chennai Port Berth
      }
    },
    {
      type: "Feature",
      id: "fleet-DEL-BOM-884",
      properties: {
        trackingId: "DEL-BOM-884",
        vehicleReg: "WAG-12B-60028",
        vehicleModel: "Alstom Prima T8 Double-Loco",
        driver: "Loco Pilot Rajesh Patil",
        origin: "Dadri WDFC Terminal",
        destination: "JNPT Nhava Sheva",
        status: "IN_TRANSIT",
        speed: "95 km/h",
        heading: 215,
        temperature: "Double-Stack Container Rake",
        eWayBill: "EWB-DL-4491028341",
        cargo: "90 TEU Mixed Export Goods",
        eta: "8h 15m",
      },
      geometry: {
        type: "Point",
        coordinates: [74.5854, 24.5854] // WDFC track near Udaipur/Palanpur
      }
    },
    {
      type: "Feature",
      id: "fleet-NAG-HYD-502",
      properties: {
        trackingId: "NAG-HYD-502",
        vehicleReg: "MH-31-CB-9012",
        vehicleModel: "BharatBenz 2823R Reefer Cold-Chain",
        driver: "Vikram Deshmukh",
        origin: "Nagpur Multi-Modal Zero Mile",
        destination: "Hyderabad Genome Valley",
        status: "OUT_FOR_DELIVERY",
        speed: "62 km/h",
        heading: 180,
        temperature: "-18.4°C (Optimal)",
        eWayBill: "EWB-MH-1192837482",
        cargo: "Temperature Sensitive Biological Vaccines",
        eta: "1h 10m",
      },
      geometry: {
        type: "Point",
        coordinates: [78.4867, 17.5500] // Approaching Genome Valley, Hyderabad
      }
    }
  ]
};

// 8. FASTag Toll Plazas
export const INDIA_FASTAG_TOLLS: GeoFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "toll-kherki-daula",
      properties: {
        name: "Kherki Daula Toll Plaza",
        corridor: "Delhi-Jaipur Expressway (NH-48)",
        dailyFastagScans: "92,400 vehicles",
        avgClearanceTime: "3.2 seconds",
      },
      geometry: {
        type: "Point",
        coordinates: [76.9900, 28.3900]
      }
    },
    {
      type: "Feature",
      id: "toll-kishangarh",
      properties: {
        name: "Kishangarh Toll Plaza",
        corridor: "Rajasthan Freight Corridor (NH-48)",
        dailyFastagScans: "64,200 vehicles",
        avgClearanceTime: "2.8 seconds",
      },
      geometry: {
        type: "Point",
        coordinates: [74.8600, 26.5700]
      }
    },
    {
      type: "Feature",
      id: "toll-bharuch",
      properties: {
        name: "Bharuch Narmada Bridge Toll",
        corridor: "Gujarat Maritime Link (NH-48)",
        dailyFastagScans: "78,900 vehicles",
        avgClearanceTime: "4.1 seconds",
      },
      geometry: {
        type: "Point",
        coordinates: [73.0100, 21.7200]
      }
    },
    {
      type: "Feature",
      id: "toll-krishnagiri",
      properties: {
        name: "Krishnagiri Toll Plaza",
        corridor: "Bengaluru-Chennai Corridor (NH-44/48)",
        dailyFastagScans: "58,100 vehicles",
        avgClearanceTime: "3.0 seconds",
      },
      geometry: {
        type: "Point",
        coordinates: [78.2200, 12.5200]
      }
    }
  ]
};

// =========================================================================
// 9. EXPANDED 23 STRATEGIC INDIAN LOGISTICS NODES REGISTRY
// Supports Context-Aware Polymorphic Naming:
// DFC Railway Stations vs. Air Cargo Airports vs. Standard Road Cities
// =========================================================================

export interface PharmaLogisticsNode {
  id: string;
  coordinates: [number, number]; // Strictly [lng, lat]
  tier: "NATIONAL_VACCINE_HUB" | "PHARMA_MANUFACTURING_CLUSTER" | "CENTRAL_HOSPITAL_DEPOT" | "AIR_MEDICAL_GATEWAY" | "METRO" | "INDUSTRIAL_HUB" | "PORT" | "GATEWAY";
  modes: Array<"ROAD" | "RAIL_DFC" | "AIR" | "COLD_CHAIN">;

  // CDSCO & Healthcare Cluster Identity
  clusterName?: string;
  reeferPlugPoints?: number;
  coldStorageCapacityPallets?: number;
  ambientTempC?: number;
  activeReeferUnits?: number;
  complianceRatePercent?: number;
  status?: "TEMPERATURE_STABLE" | "EXCURSION_RISK" | "DISPATCH_READY" | "OPTIMAL" | "HIGH_DENSITY" | "MAINTENANCE" | "MONSOON_ALERT";

  // Standard City / Road Identity
  city: {
    name: string;
    code: string;
    state: string;
    type: string;
  };

  // DFC / Rail Freight Identity (optional if node has rail freight connectivity)
  rail?: {
    stationName: string;
    stationCode: string;
    corridor: "WDFC" | "EDFC" | "FEEDER_RAIL";
    yardType: string;
  };

  // Air Cargo Express Identity (optional if node has cargo airport)
  air?: {
    airportName: string;
    iataCode: string;
    terminal: string;
  };

  telemetry: {
    status: "TEMPERATURE_STABLE" | "EXCURSION_RISK" | "DISPATCH_READY" | "OPTIMAL" | "HIGH_DENSITY" | "MAINTENANCE" | "MONSOON_ALERT";
    throughputTEU: string;
    avgSpeedKmh: number;
    activeConsignments: number;
    coldStoragePallets?: number;
    ambientTempC?: number;
    reeferUnits?: number;
    complianceRate?: number;
  };
}

export type LogisticsNode = PharmaLogisticsNode;

export interface NodeDisplayInfo {
  displayName: string;
  badgeCode: string;
  subLabel: string;
  category: string;
  iconType: "rail" | "air" | "road" | "cold";
  isPrimaryForMode: boolean;
  accentColor: string;
  secondaryInfo: string;
}

export const LOGISTICS_NODES: LogisticsNode[] = [
  // 1. Delhi NCR / Dadri (National Command & WDFC/EDFC Interchange)
  {
    id: "delhi-dadri",
    coordinates: [77.5550, 28.5355],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "AIIMS National Vaccine Reserve & Dadri Reefer Gateway",
    reeferPlugPoints: 240,
    coldStorageCapacityPallets: 45000,
    ambientTempC: 4,
    activeReeferUnits: 85,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Delhi NCR / AIIMS Reserve",
      code: "DEL",
      state: "National Capital Region",
      type: "National Biologics Command Depot",
    },
    rail: {
      stationName: "New Dadri Reefer Rail Terminal",
      stationCode: "NDDT",
      corridor: "WDFC",
      yardType: "WDFC/EDFC Cold Container Yard",
    },
    air: {
      airportName: "Indira Gandhi Int'l Airport",
      iataCode: "DEL",
      terminal: "Air Cargo Terminal 2 (Pharma Dedicated Zone)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "850K TEU / yr",
      avgSpeedKmh: 58,
      activeConsignments: 1420,
      coldStoragePallets: 45000,
      ambientTempC: 4,
      reeferUnits: 85,
      complianceRate: 99.9,
    },
  },

  // 2. Rewari MMLP (WDFC Electric Double-Stack Yard)
  {
    id: "rewari",
    coordinates: [76.6178, 28.1920],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "COLD_CHAIN"],
    clusterName: "Rewari Pharma MMLP (WDFC Reefer Rake Siding)",
    reeferPlugPoints: 120,
    coldStorageCapacityPallets: 18000,
    ambientTempC: -20,
    activeReeferUnits: 42,
    complianceRatePercent: 99.7,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Rewari Pharma Hub",
      code: "RE",
      state: "Haryana",
      type: "Multimodal Vaccine Corridor Siding",
    },
    rail: {
      stationName: "New Rewari Junction Reefer Yard",
      stationCode: "RE",
      corridor: "WDFC",
      yardType: "WDFC Double-Stack Reefer Rake Siding",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "420K TEU / yr",
      avgSpeedKmh: 78,
      activeConsignments: 680,
      coldStoragePallets: 18000,
      ambientTempC: -20,
      reeferUnits: 42,
      complianceRate: 99.7,
    },
  },

  // 3. Khurja Junction (EDFC Control & Crossing Yard)
  {
    id: "khurja",
    coordinates: [77.8500, 28.2500],
    tier: "GATEWAY",
    modes: ["ROAD", "RAIL_DFC", "COLD_CHAIN"],
    clusterName: "Khurja EDFC Biologics Crossing Interchange",
    reeferPlugPoints: 80,
    coldStorageCapacityPallets: 12000,
    ambientTempC: 5,
    activeReeferUnits: 28,
    complianceRatePercent: 99.5,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Khurja Junction",
      code: "KRJ",
      state: "Uttar Pradesh",
      type: "EDFC Strategic Pharma Control Node",
    },
    rail: {
      stationName: "New Khurja Junction Reefer Terminal",
      stationCode: "KRJ",
      corridor: "EDFC",
      yardType: "EDFC Fast Cold Freight Crossing",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "380K TEU / yr",
      avgSpeedKmh: 82,
      activeConsignments: 540,
      coldStoragePallets: 12000,
      ambientTempC: 5,
      reeferUnits: 28,
      complianceRate: 99.5,
    },
  },

  // 4. Baddi Formulation Belt (Asia's Largest Pharma Manufacturing Hub)
  {
    id: "baddi",
    coordinates: [76.7914, 30.9578],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "COLD_CHAIN"],
    clusterName: "Baddi-Barotiwala-Nalagarh Formulation Belt",
    reeferPlugPoints: 210,
    coldStorageCapacityPallets: 38000,
    ambientTempC: -20,
    activeReeferUnits: 72,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Baddi Formulation Belt",
      code: "BDD",
      state: "Himachal Pradesh",
      type: "Asia's Largest Formulation Manufacturing Hub",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "410K TEU / yr",
      avgSpeedKmh: 54,
      activeConsignments: 890,
      coldStoragePallets: 38000,
      ambientTempC: -20,
      reeferUnits: 72,
      complianceRate: 99.9,
    },
  },

  // 5. Ludhiana (EDFC Northern Terminus)
  {
    id: "ludhiana",
    coordinates: [75.8573, 30.9010],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Sahnewal EDFC Terminus & Punjab Pharma Gateway",
    reeferPlugPoints: 160,
    coldStorageCapacityPallets: 24000,
    ambientTempC: 2,
    activeReeferUnits: 56,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Ludhiana Logistics Terminus",
      code: "LDH",
      state: "Punjab",
      type: "Formulations & Oncology Supply Hub",
    },
    rail: {
      stationName: "New Sahnewal EDFC Reefer Terminal",
      stationCode: "SNWL",
      corridor: "EDFC",
      yardType: "EDFC Cold Rake Northern Terminus",
    },
    air: {
      airportName: "Sahnewal Air Cargo Terminal",
      iataCode: "LUH",
      terminal: "Pharma Express Lifeline Apron",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "310K TEU / yr",
      avgSpeedKmh: 68,
      activeConsignments: 490,
      coldStoragePallets: 24000,
      ambientTempC: 2,
      reeferUnits: 56,
      complianceRate: 99.8,
    },
  },

  // 5. Kanpur Panki ICD
  {
    id: "kanpur",
    coordinates: [80.3319, 26.4499],
    tier: "CENTRAL_HOSPITAL_DEPOT",
    modes: ["ROAD", "RAIL_DFC", "COLD_CHAIN"],
    clusterName: "Panki Pharma Depot & Central UP Medical Reserve",
    reeferPlugPoints: 90,
    coldStorageCapacityPallets: 15000,
    ambientTempC: 4,
    activeReeferUnits: 34,
    complianceRatePercent: 99.4,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Kanpur Panki Medical Hub",
      code: "KNU",
      state: "Uttar Pradesh",
      type: "Central UP Critical Care Depot",
    },
    rail: {
      stationName: "New Bhaupur Reefer Siding",
      stationCode: "BPU",
      corridor: "EDFC",
      yardType: "EDFC Pharma Reefer Siding",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "290K TEU / yr",
      avgSpeedKmh: 74,
      activeConsignments: 410,
      coldStoragePallets: 15000,
      ambientTempC: 4,
      reeferUnits: 34,
      complianceRate: 99.4,
    },
  },

  // 6. Varanasi / DDU (Asia's Largest Marshalling Yard)
  {
    id: "ddu-varanasi",
    coordinates: [83.1167, 25.2833],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "DDU Eastern Vaccine Marshalling & Transshipment Depot",
    reeferPlugPoints: 180,
    coldStorageCapacityPallets: 28000,
    ambientTempC: -20,
    activeReeferUnits: 64,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Varanasi / DDU",
      code: "DDU",
      state: "Uttar Pradesh",
      type: "Eastern Healthcare Transshipment Crossroads",
    },
    rail: {
      stationName: "New DDU Junction Reefer Yard",
      stationCode: "DDU",
      corridor: "EDFC",
      yardType: "Asia's Largest Reefer Marshalling Yard",
    },
    air: {
      airportName: "Lal Bahadur Shastri Int'l Airport",
      iataCode: "VNS",
      terminal: "Cold-Chain Perishables & Biologics Facility",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "640K TEU / yr",
      avgSpeedKmh: 72,
      activeConsignments: 760,
      coldStoragePallets: 28000,
      ambientTempC: -20,
      reeferUnits: 64,
      complianceRate: 99.8,
    },
  },

  // 7. Jaipur Sitapura Hub
  {
    id: "jaipur",
    coordinates: [75.7873, 26.9124],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Sitapura Pharma SEZ & Rajasthan Vaccine Reserve",
    reeferPlugPoints: 110,
    coldStorageCapacityPallets: 16000,
    ambientTempC: 4,
    activeReeferUnits: 38,
    complianceRatePercent: 99.6,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Jaipur Sitapura Pharma Hub",
      code: "JAI",
      state: "Rajasthan",
      type: "State Central Biologics Depot",
    },
    rail: {
      stationName: "New Phulera Reefer Siding",
      stationCode: "FL",
      corridor: "WDFC",
      yardType: "WDFC Transshipment Reefer Siding",
    },
    air: {
      airportName: "Jaipur International Airport",
      iataCode: "JAI",
      terminal: "Domestic Air Cargo Complex (Coolport)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "340K TEU / yr",
      avgSpeedKmh: 65,
      activeConsignments: 520,
      coldStoragePallets: 16000,
      ambientTempC: 4,
      reeferUnits: 38,
      complianceRate: 99.6,
    },
  },

  // 8. Palanpur Junction (WDFC High-Speed Siding)
  {
    id: "palanpur",
    coordinates: [72.4385, 24.1722],
    tier: "GATEWAY",
    modes: ["ROAD", "RAIL_DFC", "COLD_CHAIN"],
    clusterName: "Palanpur WDFC Cold Chain Junction",
    reeferPlugPoints: 75,
    coldStorageCapacityPallets: 9500,
    ambientTempC: 5,
    activeReeferUnits: 22,
    complianceRatePercent: 99.5,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Palanpur Cold Gateway",
      code: "PNU",
      state: "Gujarat",
      type: "Rajasthan-Gujarat Border Reefer Rail Crossing",
    },
    rail: {
      stationName: "New Palanpur Junction Reefer Yard",
      stationCode: "PNU",
      corridor: "WDFC",
      yardType: "Double-Stack High Speed Reefer Loop",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "510K TEU / yr",
      avgSpeedKmh: 88,
      activeConsignments: 620,
      coldStoragePallets: 9500,
      ambientTempC: 5,
      reeferUnits: 22,
      complianceRate: 99.5,
    },
  },

  // 9. Ahmedabad / Sanand (WDFC Auto Loading Yard)
  {
    id: "ahmedabad-sanand",
    coordinates: [72.5714, 23.0225],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Zydus Cadila & Changodar-Sanand Pharma Belt",
    reeferPlugPoints: 210,
    coldStorageCapacityPallets: 38000,
    ambientTempC: -20,
    activeReeferUnits: 72,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Ahmedabad / Sanand",
      code: "AMD",
      state: "Gujarat",
      type: "Western API & Critical Vaccine Belt",
    },
    rail: {
      stationName: "New Sanand Reefer Yard",
      stationCode: "SAU",
      corridor: "WDFC",
      yardType: "Pharma Container Reefer Loading Complex",
    },
    air: {
      airportName: "Sardar Vallabhbhai Patel Int'l Airport",
      iataCode: "AMD",
      terminal: "Pharma & Perishable Cargo Coolport",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "720K TEU / yr",
      avgSpeedKmh: 70,
      activeConsignments: 980,
      coldStoragePallets: 38000,
      ambientTempC: -20,
      reeferUnits: 72,
      complianceRate: 99.9,
    },
  },

  // 10. Mundra Port & SEZ
  {
    id: "mundra",
    coordinates: [69.7258, 22.8394],
    tier: "PORT",
    modes: ["ROAD", "RAIL_DFC", "COLD_CHAIN"],
    clusterName: "Mundra Port Deep-Freeze Marine SEZ",
    reeferPlugPoints: 320,
    coldStorageCapacityPallets: 52000,
    ambientTempC: -25,
    activeReeferUnits: 110,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Mundra Port SEZ",
      code: "MUN",
      state: "Gujarat",
      type: "Deep-Draft Reefer Export Mega Port",
    },
    rail: {
      stationName: "Adani Mundra Port Yard",
      stationCode: "MPY",
      corridor: "FEEDER_RAIL",
      yardType: "Reefer Container Berth Rail Siding",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "6.8M TEU / yr",
      avgSpeedKmh: 62,
      activeConsignments: 1140,
      coldStoragePallets: 52000,
      ambientTempC: -25,
      reeferUnits: 110,
      complianceRate: 99.8,
    },
  },

  // 11. Surat / Hazira Port
  {
    id: "surat-hazira",
    coordinates: [72.8311, 21.1702],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Surat-Hazira Critical Pharma & API Formulation Node",
    reeferPlugPoints: 140,
    coldStorageCapacityPallets: 20000,
    ambientTempC: 4,
    activeReeferUnits: 46,
    complianceRatePercent: 99.6,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Surat / Hazira",
      code: "ST",
      state: "Gujarat",
      type: "Active Pharmaceutical Ingredients (API) Hub",
    },
    rail: {
      stationName: "New Gadhpur WDFC Siding",
      stationCode: "GDH",
      corridor: "WDFC",
      yardType: "Temperature-Controlled Chemical & API Siding",
    },
    air: {
      airportName: "Surat International Airport",
      iataCode: "STV",
      terminal: "Domestic Air Cargo Apron",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "580K TEU / yr",
      avgSpeedKmh: 66,
      activeConsignments: 710,
      coldStoragePallets: 20000,
      ambientTempC: 4,
      reeferUnits: 46,
      complianceRate: 99.6,
    },
  },

  // 12. Mumbai / JNPT (WDFC Western Terminus)
  {
    id: "mumbai-jnpt",
    coordinates: [72.8777, 19.0760],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "JNPT Cold Port & Mumbai KEM/Tata Memorial Bio-Depot",
    reeferPlugPoints: 450,
    coldStorageCapacityPallets: 85000,
    ambientTempC: -20,
    activeReeferUnits: 165,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Mumbai / JNPT",
      code: "BOM",
      state: "Maharashtra",
      type: "National Biopharma Gateway & Onco-Hub",
    },
    rail: {
      stationName: "JNPT Cold Port Yard",
      stationCode: "JNPT",
      corridor: "WDFC",
      yardType: "WDFC Reefer Intermodal Terminus",
    },
    air: {
      airportName: "Chhatrapati Shivaji Maharaj Int'l Airport",
      iataCode: "BOM",
      terminal: "Air Cargo Complex (Coolport Life Sciences)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "7.6M TEU / yr",
      avgSpeedKmh: 48,
      activeConsignments: 2180,
      coldStoragePallets: 85000,
      ambientTempC: -20,
      reeferUnits: 165,
      complianceRate: 99.9,
    },
  },

  // 13. Pune Chakan MIDC (Auto & Biotech Hub)
  {
    id: "pune",
    coordinates: [73.8567, 18.5204],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Serum Institute of India (SII) & Chakan Biotech Corridor",
    reeferPlugPoints: 380,
    coldStorageCapacityPallets: 72000,
    ambientTempC: -20,
    activeReeferUnits: 140,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Pune Biotech Corridor",
      code: "PNQ",
      state: "Maharashtra",
      type: "Global Vaccine Capital & Biologics Hub",
    },
    rail: {
      stationName: "Talegaon Reefer Siding",
      stationCode: "TGN",
      corridor: "FEEDER_RAIL",
      yardType: "Temperature-Controlled Vaccine Rail Siding",
    },
    air: {
      airportName: "Pune International Airport",
      iataCode: "PNQ",
      terminal: "Pharma Coolport Cargo Terminal",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "490K TEU / yr",
      avgSpeedKmh: 60,
      activeConsignments: 840,
      coldStoragePallets: 72000,
      ambientTempC: -20,
      reeferUnits: 140,
      complianceRate: 99.9,
    },
  },

  // 14. Nagpur Zero-Mile (Central Multi-Modal Hub)
  {
    id: "nagpur",
    coordinates: [79.0882, 21.1458],
    tier: "CENTRAL_HOSPITAL_DEPOT",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "MIHAN Central India Blood Bank & Cryogenic Vaccine Depot",
    reeferPlugPoints: 160,
    coldStorageCapacityPallets: 26000,
    ambientTempC: -20,
    activeReeferUnits: 58,
    complianceRatePercent: 99.7,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Nagpur MIHAN Life Sciences",
      code: "NAG",
      state: "Maharashtra",
      type: "Geographic Zero-Mile Healthcare Crossroad",
    },
    rail: {
      stationName: "Ajni CONCOR Reefer Depot",
      stationCode: "AJNI",
      corridor: "FEEDER_RAIL",
      yardType: "Central India Reefer Transshipment Siding",
    },
    air: {
      airportName: "Dr. Babasaheb Ambedkar Int'l Airport",
      iataCode: "NAG",
      terminal: "MIHAN Air Logistics Terminal (Cold Chain Apron)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "420K TEU / yr",
      avgSpeedKmh: 68,
      activeConsignments: 790,
      coldStoragePallets: 26000,
      ambientTempC: -20,
      reeferUnits: 58,
      complianceRate: 99.7,
    },
  },

  // 15. Raipur (Central Steel & Minerals)
  {
    id: "raipur",
    coordinates: [81.6296, 21.2514],
    tier: "CENTRAL_HOSPITAL_DEPOT",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "AIIMS Raipur Central Biologics Depot",
    reeferPlugPoints: 70,
    coldStorageCapacityPallets: 11000,
    ambientTempC: 4,
    activeReeferUnits: 25,
    complianceRatePercent: 99.4,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Raipur Healthcare Depot",
      code: "RPR",
      state: "Chhattisgarh",
      type: "Eastern-Central Medical Supplies Hub",
    },
    rail: {
      stationName: "Mandir Hasaud Reefer Siding",
      stationCode: "MNDH",
      corridor: "FEEDER_RAIL",
      yardType: "Central Medical Rake Depot",
    },
    air: {
      airportName: "Swami Vivekananda Airport",
      iataCode: "RPR",
      terminal: "Domestic Air Cargo (Medical Supplies Desk)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "260K TEU / yr",
      avgSpeedKmh: 64,
      activeConsignments: 380,
      coldStoragePallets: 11000,
      ambientTempC: 4,
      reeferUnits: 25,
      complianceRate: 99.4,
    },
  },

  // 16. Kolkata / Dankuni (EDFC Eastern Terminus)
  {
    id: "kolkata-dankuni",
    coordinates: [88.3639, 22.5726],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Dankuni EDFC Pharma Terminal & Apollo Eastern Medical Gateway",
    reeferPlugPoints: 220,
    coldStorageCapacityPallets: 42000,
    ambientTempC: 2,
    activeReeferUnits: 88,
    complianceRatePercent: 99.7,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Kolkata / Dankuni",
      code: "CCU",
      state: "West Bengal",
      type: "Eastern Super-Specialty Medical Gateway",
    },
    rail: {
      stationName: "New Dankuni Reefer Terminal",
      stationCode: "DKAE",
      corridor: "EDFC",
      yardType: "EDFC Eastern Cold Chain Terminus Yard",
    },
    air: {
      airportName: "Netaji Subhash Chandra Bose Int'l Airport",
      iataCode: "CCU",
      terminal: "Air Cargo Complex (Medical Coolzone)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "1.4M TEU / yr",
      avgSpeedKmh: 52,
      activeConsignments: 1290,
      coldStoragePallets: 42000,
      ambientTempC: 2,
      reeferUnits: 88,
      complianceRate: 99.7,
    },
  },

  // 17. Visakhapatnam Port
  {
    id: "visakhapatnam",
    coordinates: [83.2185, 17.6868],
    tier: "PHARMA_MANUFACTURING_CLUSTER",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Vizag Jawaharlal Nehru Pharma City (JNPC)",
    reeferPlugPoints: 190,
    coldStorageCapacityPallets: 32000,
    ambientTempC: 5,
    activeReeferUnits: 65,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Visakhapatnam JNPC",
      code: "VTZ",
      state: "Andhra Pradesh",
      type: "Bulk Drug Manufacturing SEZ & Marine Port",
    },
    rail: {
      stationName: "Visakhapatnam Port Reefer Yard",
      stationCode: "VSKP",
      corridor: "FEEDER_RAIL",
      yardType: "Coastal Pharma Reefer Terminal",
    },
    air: {
      airportName: "Visakhapatnam International Airport",
      iataCode: "VTZ",
      terminal: "Air Cargo Apron (Pharma Direct Export Desk)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "920K TEU / yr",
      avgSpeedKmh: 62,
      activeConsignments: 650,
      coldStoragePallets: 32000,
      ambientTempC: 5,
      reeferUnits: 65,
      complianceRate: 99.8,
    },
  },

  // 18. Hyderabad (Genome Valley Pharma City)
  {
    id: "hyderabad",
    coordinates: [78.4867, 17.3850],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Genome Valley & Bharat Biotech / Dr. Reddy's Command Hub",
    reeferPlugPoints: 500,
    coldStorageCapacityPallets: 95000,
    ambientTempC: -20,
    activeReeferUnits: 190,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Hyderabad Genome Valley",
      code: "HYD",
      state: "Telangana",
      type: "Global Vaccine Capital & CDSCO Hub",
    },
    rail: {
      stationName: "Sanathnagar Reefer ICD Terminal",
      stationCode: "SNF",
      corridor: "FEEDER_RAIL",
      yardType: "Pharma Reefer Siding & Rail Logistics Depot",
    },
    air: {
      airportName: "Rajiv Gandhi International Airport",
      iataCode: "HYD",
      terminal: "GMR Hyderabad Air Cargo (Pharma Zone WHO-GDP Certified)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "680K TEU / yr",
      avgSpeedKmh: 64,
      activeConsignments: 1120,
      coldStoragePallets: 95000,
      ambientTempC: -20,
      reeferUnits: 190,
      complianceRate: 99.9,
    },
  },

  // 19. Bengaluru (Devanahalli Aerospace & Tech)
  {
    id: "bengaluru",
    coordinates: [77.5946, 12.9716],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Biocon Park, Devanahalli Coolport & Kidwai Oncology Reserve",
    reeferPlugPoints: 420,
    coldStorageCapacityPallets: 80000,
    ambientTempC: -20,
    activeReeferUnits: 155,
    complianceRatePercent: 99.9,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Bengaluru Biopharma Corridor",
      code: "BLR",
      state: "Karnataka",
      type: "Biologics & Monoclonal Antibodies Capital",
    },
    rail: {
      stationName: "Whitefield Reefer ICD Terminal",
      stationCode: "WFD",
      corridor: "FEEDER_RAIL",
      yardType: "CONCOR Cold Chain Inland Container Yard",
    },
    air: {
      airportName: "Kempegowda International Airport",
      iataCode: "BLR",
      terminal: "Menzies & AISATS Coolport (Pharma Dedicated)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "820K TEU / yr",
      avgSpeedKmh: 56,
      activeConsignments: 1540,
      coldStoragePallets: 80000,
      ambientTempC: -20,
      reeferUnits: 155,
      complianceRate: 99.9,
    },
  },

  // 20. Chennai Port & Sriperumbudur
  {
    id: "chennai",
    coordinates: [80.2707, 13.0827],
    tier: "NATIONAL_VACCINE_HUB",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Sriperumbudur MedTech SEZ & Rajiv Gandhi Hospital Depot",
    reeferPlugPoints: 260,
    coldStorageCapacityPallets: 48000,
    ambientTempC: 4,
    activeReeferUnits: 92,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Chennai Sriperumbudur",
      code: "MAA",
      state: "Tamil Nadu",
      type: "Southern MedTech & Clinical Research Hub",
    },
    rail: {
      stationName: "Ennore Port Reefer Rail Yard",
      stationCode: "ENR",
      corridor: "FEEDER_RAIL",
      yardType: "Port Reefer Intermodal Yard",
    },
    air: {
      airportName: "Chennai International Airport",
      iataCode: "MAA",
      terminal: "Integrated Air Cargo Complex (Coolzone Life Sciences)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "2.8M TEU / yr",
      avgSpeedKmh: 54,
      activeConsignments: 1320,
      coldStoragePallets: 48000,
      ambientTempC: 4,
      reeferUnits: 92,
      complianceRate: 99.8,
    },
  },

  // 21. Coimbatore (Engineering Corridor)
  {
    id: "coimbatore",
    coordinates: [76.9558, 11.0168],
    tier: "CENTRAL_HOSPITAL_DEPOT",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "KMCH Western Tamil Nadu Medical Consumables Depot",
    reeferPlugPoints: 85,
    coldStorageCapacityPallets: 14000,
    ambientTempC: 4,
    activeReeferUnits: 32,
    complianceRatePercent: 99.5,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Coimbatore Medical Hub",
      code: "CJB",
      state: "Tamil Nadu",
      type: "Western TN Critical Care Consumables Hub",
    },
    rail: {
      stationName: "Irugur Reefer Container Yard",
      stationCode: "IGU",
      corridor: "FEEDER_RAIL",
      yardType: "Medical Consumables Rail Depot",
    },
    air: {
      airportName: "Coimbatore International Airport",
      iataCode: "CJB",
      terminal: "Air Cargo Terminal (Medical Supplies Bay)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "210K TEU / yr",
      avgSpeedKmh: 62,
      activeConsignments: 340,
      coldStoragePallets: 14000,
      ambientTempC: 4,
      reeferUnits: 32,
      complianceRate: 99.5,
    },
  },

  // 22. Kochi / Vallarpadam ICTT
  {
    id: "kochi",
    coordinates: [76.2673, 9.9312],
    tier: "PORT",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Vallarpadam Cold Marine Life Sciences & Amrita Institute Lifeline",
    reeferPlugPoints: 280,
    coldStorageCapacityPallets: 46000,
    ambientTempC: -20,
    activeReeferUnits: 98,
    complianceRatePercent: 99.8,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Kochi Vallarpadam",
      code: "COK",
      state: "Kerala",
      type: "Marine Life-Sciences & Transshipment Port",
    },
    rail: {
      stationName: "Vallarpadam ICTT Reefer Yard",
      stationCode: "VPT",
      corridor: "FEEDER_RAIL",
      yardType: "Port Reefer Rail Link Terminal",
    },
    air: {
      airportName: "Cochin International Airport",
      iataCode: "COK",
      terminal: "Centre for Perishable Cargo & Life Sciences (CPC)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "780K TEU / yr",
      avgSpeedKmh: 58,
      activeConsignments: 590,
      coldStoragePallets: 46000,
      ambientTempC: -20,
      reeferUnits: 98,
      complianceRate: 99.8,
    },
  },

  // 23. Guwahati (North-East Gateway)
  {
    id: "guwahati",
    coordinates: [91.7362, 26.1445],
    tier: "AIR_MEDICAL_GATEWAY",
    modes: ["ROAD", "RAIL_DFC", "AIR", "COLD_CHAIN"],
    clusterName: "Northeast Regional Vaccine Hub & AIIMS Guwahati Lifeline",
    reeferPlugPoints: 120,
    coldStorageCapacityPallets: 19000,
    ambientTempC: 2,
    activeReeferUnits: 45,
    complianceRatePercent: 99.6,
    status: "TEMPERATURE_STABLE",
    city: {
      name: "Guwahati Medical Gateway",
      code: "GAU",
      state: "Assam",
      type: "Seven-Sisters Critical Healthcare Lifeline",
    },
    rail: {
      stationName: "New Guwahati Reefer Rail Terminal",
      stationCode: "NGC",
      corridor: "FEEDER_RAIL",
      yardType: "Broad-Gauge Reefer Transshipment Yard",
    },
    air: {
      airportName: "Lokpriya Gopinath Bordoloi Int'l Airport",
      iataCode: "GAU",
      terminal: "NER Air Cargo Complex (Medical Priority Apron)",
    },
    telemetry: {
      status: "TEMPERATURE_STABLE",
      throughputTEU: "140K TEU / yr",
      avgSpeedKmh: 50,
      activeConsignments: 420,
      coldStoragePallets: 19000,
      ambientTempC: 2,
      reeferUnits: 45,
      complianceRate: 99.6,
    },
  },
];

/**
 * Progressive Zoom-Tier Classification for Indian Logistics Nodes:
 * - Tier 1: Major Metros (Visible & Blinking immediately at default continental zoom >= 3.5)
 * - Tier 2: Medium Regional Cities (Appear & Blink when zoom >= 5.0)
 * - Tier 3: Specialized Freight / Pharma Towns (Appear & Blink when zoom >= 6.0)
 */
export const getNodeTier = (code: string): 1 | 2 | 3 => {
  const cleanCode = code.replace(/[\[\]]/g, "").toUpperCase();
  const tier1 = [
    "DEL", "NDDT", "BOM", "JNPT", "CCU", "DKAE", "MAA", "TNPM",
    "BLR", "WFD", "HYD", "SNF", "AMD", "SAU", "GAU", "NGC"
  ];
  const tier2 = [
    "PNQ", "HDP", "NAG", "AJNI", "JAI", "FL", "ST", "GTX",
    "KNU", "KNP", "CPB", "COK", "VPDP", "VTZ", "VSKP", "IDR",
    "TIHI", "BBI", "KUR", "PRYJ", "PRG"
  ];
  if (tier1.includes(cleanCode)) return 1;
  if (tier2.includes(cleanCode)) return 2;
  return 3;
};

/**
 * Returns context-aware dynamic naming, badges, and metadata
 * based on the active logistics corridor mode:
 * - "RAIL_DFC": Indian Railways / DFC Reefer Rail Terminals (e.g. New Dadri Reefer Rail Terminal [NDDT])
 * - "AIR": Official Airport Medical Lifelines & IATA codes (e.g. Indira Gandhi Int'l Airport [DEL])
 * - "COLD_CHAIN": Cryogenic (-80°C/-20°C) and Biologics (+2°C to +8°C) Reefer Hubs
 * - "ROAD" / "ALL": CDSCO Certified Pharma & Vaccine Clusters
 */
export function getNodeDisplay(
  node: LogisticsNode,
  mode: "ALL" | "RAIL_DFC" | "ROAD" | "AIR" | "COLD_CHAIN"
): NodeDisplayInfo {
  if (mode === "RAIL_DFC") {
    if (node.rail) {
      return {
        displayName: node.rail.stationName,
        badgeCode: node.rail.stationCode,
        subLabel: `${node.rail.corridor} Reefer Container Rail`,
        category: `${node.rail.corridor} • Temp-Controlled Rail Rake`,
        iconType: "rail",
        isPrimaryForMode: true,
        accentColor: "#10B981", // Emerald
        secondaryInfo: `${node.rail.yardType} • ${node.activeReeferUnits || 45} Reefer Rakes`,
      };
    }
    return {
      displayName: `${node.city.name} Reefer Feeder`,
      badgeCode: node.city.code,
      subLabel: "Feeder Link to DFC Reefer Network",
      category: "Surface Rail Feeder",
      iconType: "road",
      isPrimaryForMode: false,
      accentColor: "#64748B",
      secondaryInfo: "Feeder Highway Connection",
    };
  }

  if (mode === "AIR") {
    if (node.air) {
      return {
        displayName: node.air.airportName,
        badgeCode: node.air.iataCode,
        subLabel: `Emergency Air Medical Cargo • ${node.air.iataCode}`,
        category: `Air Plasma/Organ Lifeline • ${node.air.terminal}`,
        iconType: "air",
        isPrimaryForMode: true,
        accentColor: "#38BDF8", // Sky Blue
        secondaryInfo: `${node.air.terminal} • Active CDSCO Air Lifeline`,
      };
    }
    return {
      displayName: `${node.city.name} Air Link`,
      badgeCode: node.city.code,
      subLabel: "Surface Air-Cargo Feeder",
      category: "Surface Transit to Airport",
      iconType: "road",
      isPrimaryForMode: false,
      accentColor: "#64748B",
      secondaryInfo: "Surface Medical Express to Airport",
    };
  }

  if (mode === "COLD_CHAIN") {
    const isCold = node.modes.includes("COLD_CHAIN");
    if (isCold) {
      const tempDisplay = node.ambientTempC !== undefined ? (node.ambientTempC <= 0 ? `${node.ambientTempC}°C` : `+${node.ambientTempC}°C`) : "-20°C";
      return {
        displayName: node.clusterName ? node.clusterName.split("&")[0].trim() : `${node.city.name} Cold Chain`,
        badgeCode: tempDisplay,
        subLabel: `${node.reeferPlugPoints || 120} Reefer Plugs • ${node.complianceRatePercent || 99.8}% GDP`,
        category: "CDSCO Form 20B/21B • Zero-Excursion Biologics Depot",
        iconType: "cold",
        isPrimaryForMode: true,
        accentColor: node.status === "EXCURSION_RISK" ? "#F59E0B" : "#00F2FE", // Cyan or Warning Amber
        secondaryInfo: `Continuous Telemetry Sensors • ${node.coldStorageCapacityPallets?.toLocaleString() || "25,000"} Pallet Capacity`,
      };
    }
    return {
      displayName: node.city.name,
      badgeCode: node.city.code,
      subLabel: "Standard Ambient Medical Depot",
      category: "Controlled Ambient Facility (+15°C to +25°C)",
      iconType: "road",
      isPrimaryForMode: false,
      accentColor: "#64748B",
      secondaryInfo: "Ambient Pharmaceuticals Only",
    };
  }

  // Standard "ALL" or "ROAD"
  return {
    displayName: node.city.name,
    badgeCode: node.city.code,
    subLabel: `${node.city.state} • ${node.clusterName ? node.clusterName.split("&")[0].trim() : node.city.type}`,
    category: `${node.tier} • CDSCO GDP Certified`,
    iconType: node.modes.includes("COLD_CHAIN") ? "cold" : "road",
    isPrimaryForMode: true,
    accentColor: "#00F2FE", // Neon Cyan
    secondaryInfo: `${node.coldStorageCapacityPallets?.toLocaleString() || "30,000"} Pallets • ${node.complianceRatePercent || 99.8}% Compliance`,
  };
}



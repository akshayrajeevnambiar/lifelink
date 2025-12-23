import "dotenv/config";
import { PrismaClient, BloodGroup } from "@prisma/client";

const prisma = new PrismaClient();

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

// Sample data - rest stays the same...
const donorsData = [
  // Toronto donors
  {
    name: "Sarah Johnson",
    bloodGroup: "O_POSITIVE" as BloodGroup,

    location: "Toronto, ON",
    phone: "+1 (416) 555-0101",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  },
  {
    name: "Michael Chen",
    bloodGroup: "A_POSITIVE" as BloodGroup,
    location: "Toronto, ON",
    phone: "+1 (416) 555-0102",
    isAvailable: true,
    photoUrl: null, // No photo
  },
  {
    name: "Emily Rodriguez",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    location: "Toronto, ON",
    phone: "+1 (416) 555-0103",
    isAvailable: false, // Unavailable
    lastDonationDate: new Date("2024-11-15"), // Recent donation
  },
  {
    name: "David Kim",
    bloodGroup: "AB_POSITIVE" as BloodGroup,
    location: "Toronto, ON",
    phone: "+1 (416) 555-0104",
    isAvailable: true,
  },
  {
    name: "Jessica Brown",
    bloodGroup: "O_NEGATIVE" as BloodGroup,
    location: "Toronto, ON",
    phone: "+1 (416) 555-0105",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample2.jpg",
  },

  // Mississauga donors
  {
    name: "Robert Wilson",
    bloodGroup: "A_NEGATIVE" as BloodGroup,
    location: "Mississauga, ON",
    phone: "+1 (905) 555-0201",
    isAvailable: true,
  },
  {
    name: "Amanda Lee",
    bloodGroup: "B_NEGATIVE" as BloodGroup,
    location: "Mississauga, ON",
    phone: "+1 (905) 555-0202",
    isAvailable: true,
  },
  {
    name: "James Taylor",
    bloodGroup: "AB_NEGATIVE" as BloodGroup,
    location: "Mississauga, ON",
    phone: "+1 (905) 555-0203",
    isAvailable: false,
  },
  {
    name: "Lisa Anderson",
    bloodGroup: "O_POSITIVE" as BloodGroup,
    location: "Mississauga, ON",
    phone: "+1 (905) 555-0204",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample3.jpg",
  },

  // Brampton donors
  {
    name: "Christopher Martin",
    bloodGroup: "A_POSITIVE" as BloodGroup,
    location: "Brampton, ON",
    phone: "+1 (905) 555-0301",
    isAvailable: true,
  },
  {
    name: "Jennifer Garcia",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    location: "Brampton, ON",
    phone: "+1 (905) 555-0302",
    isAvailable: true,
  },
  {
    name: "Daniel Martinez",
    bloodGroup: "O_NEGATIVE" as BloodGroup,
    location: "Brampton, ON",
    phone: "+1 (905) 555-0303",
    isAvailable: true,
    lastDonationDate: new Date("2024-10-01"),
  },

  // Markham donors
  {
    name: "Michelle Wong",
    bloodGroup: "AB_POSITIVE" as BloodGroup,
    location: "Markham, ON",
    phone: "+1 (905) 555-0401",
    isAvailable: true,
  },
  {
    name: "Kevin Patel",
    bloodGroup: "A_NEGATIVE" as BloodGroup,
    location: "Markham, ON",
    phone: "+1 (905) 555-0402",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample4.jpg",
  },
  {
    name: "Rachel Thompson",
    bloodGroup: "B_NEGATIVE" as BloodGroup,
    location: "Markham, ON",
    phone: "+1 (905) 555-0403",
    isAvailable: false,
  },

  // Vaughan donors
  {
    name: "Andrew Jackson",
    bloodGroup: "O_POSITIVE" as BloodGroup,
    location: "Vaughan, ON",
    phone: "+1 (905) 555-0501",
    isAvailable: true,
  },
  {
    name: "Olivia White",
    bloodGroup: "A_POSITIVE" as BloodGroup,
    location: "Vaughan, ON",
    phone: "+1 (905) 555-0502",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample5.jpg",
  },
  {
    name: "Brandon Harris",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    location: "Vaughan, ON",
    phone: "+1 (905) 555-0503",
    isAvailable: true,
  },

  // Richmond Hill donors
  {
    name: "Sophia Clark",
    bloodGroup: "AB_NEGATIVE" as BloodGroup,
    location: "Richmond Hill, ON",
    phone: "+1 (905) 555-0601",
    isAvailable: true,
  },
  {
    name: "Matthew Lewis",
    bloodGroup: "O_NEGATIVE" as BloodGroup,
    location: "Richmond Hill, ON",
    phone: "+1 (905) 555-0602",
    isAvailable: true,
  },

  // Ajax donors
  {
    name: "Nicole Robinson",
    bloodGroup: "A_POSITIVE" as BloodGroup,
    location: "Ajax, ON",
    phone: "+1 (905) 555-0701",
    isAvailable: true,
  },
  {
    name: "Joshua Walker",
    bloodGroup: "B_POSITIVE" as BloodGroup,
    location: "Ajax, ON",
    phone: "+1 (905) 555-0702",
    isAvailable: false,
    lastDonationDate: new Date("2024-12-01"),
  },

  // Pickering donors
  {
    name: "Ashley Hall",
    bloodGroup: "O_POSITIVE" as BloodGroup,
    location: "Pickering, ON",
    phone: "+1 (905) 555-0801",
    isAvailable: true,
    photoUrl: "https://res.cloudinary.com/demo/image/upload/sample6.jpg",
  },
  {
    name: "Ryan Young",
    bloodGroup: "AB_POSITIVE" as BloodGroup,
    location: "Pickering, ON",
    phone: "+1 (905) 555-0802",
    isAvailable: true,
  },
  {
    name: "Victoria King",
    bloodGroup: "A_NEGATIVE" as BloodGroup,
    location: "Pickering, ON",
    phone: "+1 (905) 555-0803",
    isAvailable: true,
  },
];

// Helper function to normalize location
function normalizeLocation(location: string): string {
  return location.toLowerCase().trim();
}

// Helper function to extract phone digits
function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, ""); // Remove all non-digits
}

async function main() {
  console.log("🌱 Starting seed...");

  let created = 0;
  let skipped = 0;

  for (const donor of donorsData) {
    try {
      // Use upsert for idempotent seeding
      // If donor exists (same phone + blood + location), skip
      // Otherwise create new donor
      const result = await prisma.donor.upsert({
        where: {
          // Unique constraint: phoneDigits + bloodGroup + locationNormalized
          phoneDigits_bloodGroup_locationNormalized: {
            phoneDigits: extractPhoneDigits(donor.phone),
            bloodGroup: donor.bloodGroup,
            locationNormalized: normalizeLocation(donor.location),
          },
        },
        update: {}, // Don't update if exists
        create: {
          name: donor.name,
          bloodGroup: donor.bloodGroup,
          locationNormalized: normalizeLocation(donor.location),
          locationDisplay: donor.location,
          phoneDigits: extractPhoneDigits(donor.phone),
          phoneDisplay: donor.phone,
          photoUrl: donor.photoUrl || null,
          photoPublicId: donor.photoUrl
            ? `demo/${donor.name.toLowerCase().replace(/\s+/g, "-")}`
            : null,
          isAvailable: donor.isAvailable ?? true,
          lastDonationDate: donor.lastDonationDate || null,
          consentGiven: true, // All seed donors have given consent
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
        console.log(
          `✅ Created: ${donor.name} (${donor.bloodGroup}) in ${donor.location}`
        );
      } else {
        skipped++;
        console.log(`⏭️  Skipped: ${donor.name} (already exists)`);
      }
    } catch (error) {
      console.error(`❌ Error seeding ${donor.name}:`, error);
    }
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   Created: ${created} donors`);
  console.log(`   Skipped: ${skipped} donors (already existed)`);
  console.log(`   Total:   ${donorsData.length} donors in seed data`);

  // Show breakdown by blood type
  const bloodTypeCounts = await prisma.donor.groupBy({
    by: ["bloodGroup"],
    _count: true,
  });

  console.log("\n🩸 Donors by Blood Type:");
  bloodTypeCounts.forEach(({ bloodGroup, _count }) => {
    console.log(`   ${bloodGroup.replace("_", "")}: ${_count}`);
  });

  // Show breakdown by location
  const locationCounts = await prisma.donor.groupBy({
    by: ["locationDisplay"],
    _count: true,
  });

  console.log("\n📍 Donors by Location:");
  locationCounts.forEach(({ locationDisplay, _count }) => {
    console.log(`   ${locationDisplay}: ${_count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

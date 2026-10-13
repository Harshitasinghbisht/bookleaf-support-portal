
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import bcrypt from "bcryptjs";
import sampleData from "./data.json" with { type: "json" };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const BOOK_STATUS = {
  "Manuscript Received": "MANUSCRIPT_RECEIVED",
  Editing: "EDITING",
  "Cover Design": "COVER_DESIGN",
  Typesetting: "TYPESETTING",
  Proofreading: "PROOFREADING",
  "ISBN Assignment": "ISBN_ASSIGNMENT",
  Printing: "PRINTING",
  "Distribution Setup": "DISTRIBUTION_SETUP",
  "Published & Live": "PUBLISHED_LIVE",
};

const PRINT_PARTNER = {
  "In-House": "IN_HOUSE",
  "Repro India": "REPRO_INDIA",
  "Epitome Books": "EPITOME_BOOKS",
};

const PLATFORM = {
  "Amazon India": "AMAZON_INDIA",
  Flipkart: "FLIPKART",
  "Amazon US": "AMAZON_US",
  "Amazon UK": "AMAZON_UK",
  "BookLeaf Store": "BOOKLEAF_STORE",
};

function getBookStatus(status) {
  if (BOOK_STATUS[status]) return BOOK_STATUS[status];

  // Handles dataset labels such as "In Production - Cover Design".
  const stage = status.split(" - ").at(-1);
  if (BOOK_STATUS[stage]) return BOOK_STATUS[stage];

  throw new Error(`Unknown book status: ${status}`);
}

async function seed() {
  // Reuse this development-only password for seeded author accounts.
  // Change it before using seeded accounts outside local development.
  const passwordHash = await bcrypt.hash(
    process.env.SEED_AUTHOR_PASSWORD || "ChangeMe123!",
    10
  );

  await prisma.$transaction(async (tx) => {
    for (const authorData of sampleData.authors) {
      const user = await tx.user.upsert({
        where: { email: authorData.email },
        update: {
          name: authorData.name,
          role: "AUTHOR",
          isActive: true,
        },
        create: {
          email: authorData.email,
          name: authorData.name,
          passwordHash,
          role: "AUTHOR",
          isActive: true,
        },
      });

      const author = await tx.author.upsert({
        where: { authorCode: authorData.author_id },
        update: {
          userId: user.id,
          phone: authorData.phone ?? null,
          city: authorData.city ?? null,
          joinedDate: new Date(`${authorData.joined_date}T00:00:00.000Z`),
        },
        create: {
          authorCode: authorData.author_id,
          userId: user.id,
          phone: authorData.phone ?? null,
          city: authorData.city ?? null,
          joinedDate: new Date(`${authorData.joined_date}T00:00:00.000Z`),
        },
      });

      for (const bookData of authorData.books) {
        await tx.book.upsert({
          where: { bookCode: bookData.book_id },
          update: {
            authorId: author.id,
            title: bookData.title,
            isbn: bookData.isbn ?? null,
            genre: bookData.genre,
            status: getBookStatus(bookData.status),
            publicationDate: bookData.publication_date
              ? new Date(`${bookData.publication_date}T00:00:00.000Z`)
              : null,
            mrp: bookData.mrp ?? null,
            authorRoyaltyPerCopy:
              bookData.author_royalty_per_copy ?? null,
            totalCopiesSold: bookData.total_copies_sold,
            totalRoyaltyEarned: bookData.total_royalty_earned,
            royaltyPaid: bookData.royalty_paid,
            royaltyPending: bookData.royalty_pending,
            lastRoyaltyPayoutDate: bookData.last_royalty_payout_date
              ? new Date(
                  `${bookData.last_royalty_payout_date}T00:00:00.000Z`
                )
              : null,
            printPartner: bookData.print_partner
              ? PRINT_PARTNER[bookData.print_partner]
              : null,
            availableOn: bookData.available_on.map((platform) => {
              if (!PLATFORM[platform]) {
                throw new Error(`Unknown platform: ${platform}`);
              }
              return PLATFORM[platform];
            }),
          },
          create: {
            bookCode: bookData.book_id,
            authorId: author.id,
            title: bookData.title,
            isbn: bookData.isbn ?? null,
            genre: bookData.genre,
            status: getBookStatus(bookData.status),
            publicationDate: bookData.publication_date
              ? new Date(`${bookData.publication_date}T00:00:00.000Z`)
              : null,
            mrp: bookData.mrp ?? null,
            authorRoyaltyPerCopy:
              bookData.author_royalty_per_copy ?? null,
            totalCopiesSold: bookData.total_copies_sold,
            totalRoyaltyEarned: bookData.total_royalty_earned,
            royaltyPaid: bookData.royalty_paid,
            royaltyPending: bookData.royalty_pending,
            lastRoyaltyPayoutDate: bookData.last_royalty_payout_date
              ? new Date(
                  `${bookData.last_royalty_payout_date}T00:00:00.000Z`
                )
              : null,
            printPartner: bookData.print_partner
              ? PRINT_PARTNER[bookData.print_partner]
              : null,
            availableOn: bookData.available_on.map((platform) => {
              if (!PLATFORM[platform]) {
                throw new Error(`Unknown platform: ${platform}`);
              }
              return PLATFORM[platform];
            }),
          },
        });
      }
    }
  }
,{
  maxWait: 20000,
  timeout: 60000,
});

  console.log("Seed completed: authors and books processed.");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

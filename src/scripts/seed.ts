import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

async function seed() {
  console.log("Starting PostgreSQL seeding...");

  const dbClient = new Client({
    connectionString,
    ssl:
      connectionString.includes("sslmode=require") ||
      connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });

  await dbClient.connect();

  // Clear existing records using CASCADE to clean references automatically
  console.log("Clearing existing data...");
  await dbClient.query("TRUNCATE TABLE contacts, users, accounts CASCADE");

  // 1. Seed Account
  const accountId = uuidv4();
  console.log(`Inserting test account (ID: ${accountId})...`);
  await dbClient.query("INSERT INTO accounts (id, name) VALUES ($1, $2)", [
    accountId,
    "Default Account",
  ]);

  // 2. Seed User
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash("password123", 10);
  console.log(`Inserting test user test@example.com (ID: ${userId})...`);
  await dbClient.query(
    "INSERT INTO users (id, account_id, first_name, last_name, email, password) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, accountId, "Alex", "Smith", "test@example.com", hashedPassword],
  );

  // 3. Seed Contacts
  console.log("Inserting contacts...");
  const contactsData = [
    {
      id: uuidv4(),
      first_name: "John",
      middle_name: "Arthur",
      last_name: "Doe",
      nickname: "Johnny",
      is_favorite: true,
      personal_note: "A close college friend.",
    },
    {
      id: uuidv4(),
      first_name: "Jane",
      middle_name: null,
      last_name: "Doe",
      nickname: "Janey",
      is_favorite: false,
      personal_note: "Works at Google, met at networking event.",
    },
    {
      id: uuidv4(),
      first_name: "John",
      middle_name: "Bob",
      last_name: "Miller",
      nickname: null,
      is_favorite: true,
      personal_note: null,
    },
    {
      id: uuidv4(),
      first_name: "Alice",
      middle_name: null,
      last_name: "Johnson",
      nickname: "Ally",
      is_favorite: false,
      personal_note: null,
    },
    {
      id: uuidv4(),
      first_name: "Bob",
      middle_name: null,
      last_name: "Smith",
      nickname: "Bobby",
      is_favorite: true,
      personal_note: "Dentist.",
    },
  ];

  for (const contact of contactsData) {
    await dbClient.query(
      "INSERT INTO contacts (id, account_id, first_name, middle_name, last_name, nickname, is_favorite, personal_note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        contact.id,
        accountId,
        contact.first_name,
        contact.middle_name,
        contact.last_name,
        contact.nickname,
        contact.is_favorite,
        contact.personal_note,
      ],
    );
  }

  console.log("Seeding completed successfully!");
  await dbClient.end();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

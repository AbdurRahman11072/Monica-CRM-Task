# Monica Personal CRM Backend API

**Node.js · Express.js · TypeScript · MySQL**

A TypeScript + Express.js backend implementation of the Monica CRM "Favorite & Notes" contact extensions, built to satisfy the requirements of the **Backend Intern Assignment**.

The original assignment was specified for a PHP / Laravel / SQLite stack. This version has been rebuilt from scratch using a modern Node.js stack — `Express.js`, `TypeScript`, `MySQL`, `dotenv`, and `cors` — while preserving the same functional requirements and data model philosophy.

---

## Table of Contents

- [Features Implemented](#features-implemented)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Implementation Approach](#implementation-approach)
- [Assumptions](#assumptions)
- [Limitations & Trade-offs](#limitations--trade-offs)
- [Estimated Time Spent](#estimated-time-spent)

---

## Features Implemented

### 1. User Authentication
Simple JWT-based registration and login. All contact actions are securely partitioned by user account — a user can only ever see and modify their own contacts.

### 2. Contact Favorites
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contacts/:id/favorite` | Mark a contact as favorite |
| `DELETE` | `/api/contacts/:id/favorite` | Remove a contact from favorites |
| `PATCH` | `/api/contacts/:id/favorite` | Toggle favorite status |
| `GET` | `/api/contacts/favorites` | Shortcut listing of favorited contacts |

### 3. Personal Notes
| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/api/contacts/:id/note` | Add or update a personal note |
| `GET` | `/api/contacts/:id` | Get contact details, including `is_favorite` and `personal_note` |

### 4. Search & Filter
`GET /api/contacts` supports:
- `favorite=1` — filter to favorites only
- `search=john` — search across first name, middle name, last name, or nickname
- Multi-criteria combination, e.g. `favorite=1&search=john`
- Limit-offset pagination — `page=1&limit=10` — with metadata (`total`, `current_page`, `last_page`, `per_page`)
- Safe sorting — `sort=first_name&direction=desc`

### 5. Statistics API
`GET /api/contacts/stats` returns aggregate statistics for the authenticated user:
- `total_contacts`
- `favorite_contacts`
- `contacts_with_notes`

Computed via a single, efficient `COUNT`-based query.

### 6. Feature Test Suite
Jest + Supertest integration tests covering:
- Favorite marking, removing, and toggling
- Note creation and updating
- Filtering by favorites (`favorite=1`) combined with text search

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MySQL (`mysql2`, promise-based connection pool) |
| Security | `bcryptjs` (password hashing), `jsonwebtoken` (JWT auth) |
| Utilities | `dotenv`, `cors`, `uuid` (UUIDv4 primary keys) |
| Testing | Jest, `ts-jest`, `supertest` |

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- A running MySQL server (local or remote)

### 1. Installation
```bash
git clone https://github.com/AbdurRahman11072/Monica-CRM-Task.git
cd Monica-CRM-Task
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Then configure your MySQL connection details:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=monica_express
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Seed the Database (optional)
Creates a test account (`test@example.com` / `password123`) and 5 sample contacts:
```bash
npm run seed
```

### 5. Run the Application

**Development** (hot-reload via `nodemon`):
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

---

## API Reference

All contact endpoints require a valid JWT, supplied via the `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |

### Contacts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | List contacts (supports `search`, `favorite`, `sort`, `direction`, `page`, `limit`) |
| `GET` | `/api/contacts/:id` | Get a single contact (includes `is_favorite`, `personal_note`) |
| `GET` | `/api/contacts/favorites` | List only favorited contacts |
| `GET` | `/api/contacts/stats` | Aggregate stats for the authenticated user |
| `POST` | `/api/contacts/:id/favorite` | Mark a contact as favorite |
| `PATCH` | `/api/contacts/:id/favorite` | Toggle favorite status |
| `DELETE` | `/api/contacts/:id/favorite` | Remove favorite status |
| `PUT` | `/api/contacts/:id/note` | Add or update a personal note |

---

## Testing

Run the full integration test suite with Jest:
```bash
npm run test
```

> Tests exercise favoriting/unfavoriting, note CRUD, and combined search + favorite filtering against the database configured in `.env`.

---

## Implementation Approach

1. **Database Schema Design**
   - UUIDs used for all primary keys, mirroring the original Monica CRM data model.
   - Clean separation between `accounts` (tenant context), `users` (belong to an account, hold credentials), and `contacts` (belong to an account).

2. **Security & Authenticated Context**
   - All contact endpoints are protected by `authMiddleware`, which verifies the JWT and attaches the user context to the request.
   - Every contact query is scoped by `req.user.account_id`, so users can only ever access their own data.

3. **Non-Duplicated Query Logic**
   - A shared private utility, `ContactModel.buildWhereClause`, dynamically compiles SQL conditions for search and favorites. It's reused by both the count query (for pagination metadata) and the page/record query, avoiding logic drift between the two.

4. **Statistics Aggregation**
   - A single optimized SQL query using conditional `SUM`/`COUNT` returns totals, favorites, and note counts in one round trip — no in-memory record loading required.

---

## Assumptions

- **Account Partitioning**: In upstream Monica CRM, users belong to accounts and share vaults of contacts. This simplified version scopes contacts directly to an `account_id` under a single user's account.
- **Search Criteria**: Search performs a case-insensitive `LIKE` match against `first_name`, `middle_name`, `last_name`, and `nickname`.
- **Deletes**: Monica supports soft deletes upstream; this assignment implements standard (hard) deletes via MySQL queries. A soft-delete column could be added if required.

---

## Limitations & Trade-offs

- **Raw SQL over an ORM**: Parameterized raw SQL via `mysql2` was chosen over a heavier ORM (Prisma, TypeORM) for full control over query performance and a lighter footprint — at the cost of hand-written schema migrations.
- **Testing against the dev database**: The Jest suite currently clears tables and runs against whatever database is configured in `.env`. In a production CI/CD setup, a dedicated test database (e.g. `monica_express_test`) should be used to avoid any risk of data loss.

---

## Estimated Time Spent

| Task | Time |
|---|---|
| Project setup & dependency configuration | ~45 min |
| Database design, migrations, seed scripts | ~45 min |
| Auth flow & middleware | ~45 min |
| Contact CRUD, favorite toggle, notes | ~1 hr |
| Search, filtering, pagination, sorting | ~1 hr |
| Statistics aggregation & query optimization | ~30 min |
| Jest test suite implementation & debugging | ~45 min |
| **Total** | **~6 hours** |

---

## Author

**MD Abdur Rahman** ([@AbdurRahman11072](https://github.com/AbdurRahman11072))
[LinkedIn](https://www.linkedin.com/in/md-abdur-rahman-dev/)

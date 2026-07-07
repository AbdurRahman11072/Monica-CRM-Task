# Monica Personal CRM Backend API (Node + Express + TypeScript + MySQL)

This project is a TypeScript + Express.js backend implementation of the Monica CRM contact extensions, satisfying the tasks specified in the `Backend Intern Assignment.pdf`.

It has been rebuilt using a modern Node.js stack (`Express.js`, `TypeScript`, `MySQL`, `dotenv`, `cors`) in place of the original PHP/Laravel/SQLite implementation.

## Features Implemented
1. **User Authentication**: Simple JWT-based registration and login system. All contact actions are securely partitioned by user account.
2. **Contact Favorites**:
   - `POST /api/contacts/:id/favorite` - Mark as favorite.
   - `DELETE /api/contacts/:id/favorite` - Remove from favorites.
   - `PATCH /api/contacts/:id/favorite` - Toggle favorite status.
   - `GET /api/contacts/favorites` - Shortcut listing of favorited contacts.
3. **Personal Notes**:
   - `PUT /api/contacts/:id/note` - Add or update a personal note.
   - `GET /api/contacts/:id` - Returns contact details including `is_favorite` and `personal_note`.
4. **Search & Filter**:
   - `GET /api/contacts` with Support for:
     - `favorite=1` (filter only favorites)
     - `search=john` (search across first name, middle name, last name, or nickname)
     - Multi-criteria combination (`favorite=1&search=john`)
     - Limit-offset pagination (`page=1&limit=10`) with metadata (`total`, `current_page`, `last_page`, `per_page`).
     - Safe sorting (`sort=first_name&direction=desc`).
5. **Statistics API**:
   - `GET /api/contacts/stats` - Returns aggregate statistics (`total_contacts`, `favorite_contacts`, `contacts_with_notes`) for the authenticated user using an efficient single COUNT query.
6. **Feature Test Suite**:
   - Jest & Supertest integration tests validating:
     - Favorite marking, removing, and toggling.
     - Note creation and updating.
     - Filtering of favorites (`favorite=1`) combined with text search.

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (using `mysql2` package with promise-based connection pool)
- **Security**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT auth token verification)
- **Utilities**: `dotenv` (configuration management), `cors` (Cross-Origin Resource Sharing), `uuid` (UUIDv4 generation for DB primary keys)
- **Testing**: Jest, `ts-jest`, `supertest`

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL Server running locally or accessible remotely

### 1. Installation
Clone or navigate to the project directory:
```bash
cd monica-express-api
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Open `.env` and configure your MySQL connection details:
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
Create the database and required tables:
```bash
npm run migrate
```

### 4. Seed Database (Optional)
Populate the database with sample data (creates a test account, user `test@example.com` with password `password123`, and 5 sample contacts):
```bash
npm run seed
```

### 5. Running the Application
**Development mode** (runs server with hot-reloading via `nodemon`):
```bash
npm run dev
```

**Production mode** (compiles TypeScript to JavaScript in `dist/` and runs node):
```bash
npm run build
npm start
```

---

## Testing

Run the automated integration tests using Jest:
```bash
npm run test
```

---

## Implementation Approach

1. **Database Schema Design**: 
   - We utilized UUIDs for all primary keys to maintain consistency with the original Monica CRM DB structure.
   - We established a clean mapping of `accounts` (tenant context), `users` (which belong to an account and have authentication credentials), and `contacts` (which belong to an account).
2. **Security & Authenticated Context**: 
   - All contact endpoints are protected by `authMiddleware`.
   - The middleware verifies the JWT, loads the user context, and registers it to the request object. All contact queries are filtered by `req.user.account_id` to ensure tenants/users can only see their own contacts.
3. **Non-Duplicated Query Logic**: 
   - Built a central private utility method `ContactModel.buildWhereClause` which dynamically compiles SQL query conditions and values for search and favorites. This method is shared between the count query (used to generate pagination metadata) and the page record query.
4. **Statistics Aggregation**:
   - Implemented as a single, optimized SQL query using conditional `SUM` and `COUNT` which fetches total, favorites, and note count in one roundtrip, avoiding loading any records in-memory.

---

## Assumptions
- **Account Partitioning**: In Monica CRM, users belong to accounts and share vaults of contacts. In this simplified application, users belong to an account and contacts are directly scoped to an `account_id`.
- **Search Criteria**: Search checks matching strings (case-insensitive `LIKE` operator) against `first_name`, `middle_name`, `last_name`, and `nickname`.
- **Delete and Soft Deletes**: In Monica, soft deletes are supported. For this assignment, standard MySQL query matching is implemented; soft delete column can be added dynamically if needed.

---

## Limitations & Trade-offs
- **Raw SQL over ORM**: We chose to write optimized Raw SQL queries with parameterized statements using `mysql2` rather than importing a heavy ORM like Prisma or TypeORM. This gives us full control over query performance and keeps the project lightweight, but requires manually writing schema migrations.
- **In-Memory Testing vs Test Database**: The Jest test suite clears tables and runs against the database specified in `.env`. In a production CI/CD environment, it is best practice to configure a separate database (e.g. `monica_express_test`) for running unit/integration tests to prevent data loss.

---

## Estimated Time Spent
- **Project setup and dependencies configuration**: ~45 mins
- **Database design, migrations, and seed scripts**: ~45 mins
- **User authentication flow and middleware**: ~45 mins
- **Contact CRUD, Toggle Favorite, and Notes updates**: ~1 hr
- **Query builder for search, filtering, pagination, and sorting**: ~1 hr
- **Statistics aggregation and single-query optimization**: ~30 mins
- **Jest test suite implementation and debug**: ~45 mins
- **Total estimated time spent**: **6 hours**

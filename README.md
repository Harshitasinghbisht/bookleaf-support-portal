# BookLeaf — Full-Stack Assignment

A full-stack application for managing books, publication status, sales, royalties, and author support tickets, with role-based access for Authors and Admins.

## 1. Tech Stack

**Frontend**
- React
- JavaScript
- [Add the UI libraries used in the project]

**Backend**
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT-based authentication
- Role-based access control (RBAC)
- Socket.IO

## 2. Project Structure

```text
bookleaf-assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── data.json
│   ├── src/
│   ├── .env
│   └── package.json
├── frontend/client
│   ├── src/
│   ├── .env
│   └── package.json
└── README.md
```

*Note: The structure above is illustrative. Adjust filenames and directories to match the final repository.*

## 3. Prerequisites

Make sure the following are installed:

- Node.js and npm
- PostgreSQL database or a configured PostgreSQL hosting service
- Git

## 4. Setup Instructions

### Step 1: Clone the repository

```bash
git clone https://github.com/Harshitasinghbisht/bookleaf-support-portal.git
cd bookleaf_assignment
```

### Step 2: Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure the required environment variables.

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secure_secret"
SEED_AUTHOR_PASSWORD="your_test_password"
```

Add any additional variables required by the application, such as the frontend origin or port, according to the backend configuration.

**Important:** Never commit real database credentials, JWT secrets, or other sensitive environment variables.

### Step 3: Set up the database

Generate the Prisma Client:

```bash
npx prisma generate
```

Ensure the configured database already has the required schema. If migrations are included in the repository and have not yet been applied, run:

```bash
npx prisma migrate deploy
```

Use the migration command only when the project has the corresponding migration files.

### Step 4: Seed the sample dataset

The assignment's provided sample JSON dataset was used to populate the database with author and book records.

The seed script is located at:

```text
backend/prisma/seed.js
```

The dataset is read by the seed script from the configured JSON file.

Run the following command from the `backend` directory:

```bash
node prisma/seed.js
```

The script maps the sample data into the application's database models:

- **User:** Creates or updates login records using email as the lookup key.
- **Author:** Creates or updates author profiles using the author code.
- **Book:** Creates or updates book records using the book code.

The script uses upsert operations to reduce duplicate records when the same dataset is seeded again. Author and book fields are mapped from the provided JSON format to the application's Prisma schema, including publication status, sales, royalty information, and related metadata.

The optional `SEED_AUTHOR_PASSWORD` variable configures the password used for seeded author accounts where supported by the seed script.

### Step 5: Start the backend

```bash
npm run dev
```

If the project uses a different development script, use the command defined in `backend/package.json`.

### Step 6: Start the frontend

Open another terminal:

```bash
cd frontend/client
npm install
```

Create the frontend environment file and configure the backend API URL using the variable name expected by the application.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## 5. Role-Based Testing

The application supports two roles:

- **AUTHOR:** Can access their own books, relevant publication and royalty information, and their support tickets.
- **ADMIN:** Can access administrative functionality, including cross-author data and ticket management where permitted by the application.

### Testing the Author role

Use a seeded author's login credentials to verify that the author can access their own dashboard and related records.

Also verify that an author cannot retrieve another author's private records by changing a book or ticket identifier in a request.

### Testing the Admin role

For testing administrative functionality, one existing author's account was promoted to the `ADMIN` role in the database. This allowed the same application to be tested with both author and admin permissions.

To perform this update on a local or test database, execute the following SQL through a trusted PostgreSQL client, replacing the email with the account you intend to promote:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'test-author@example.com';
```

Verify the update:

```sql
SELECT email, role
FROM "User"
WHERE email = 'test-author@example.com';
```

The SQL assumes that the Prisma model maps to the PostgreSQL table `"User"` and that `role` is the relevant enum or role field. Confirm these names against `schema.prisma` before executing the query.

**Testing note:** Use a dedicated test account and a development database. After changing a role, log in again or refresh the authentication session if the application stores the role in a JWT or cookie.

## 6. Assumptions and Implementation Notes

1. **Sample dataset:** The provided assignment JSON file was treated as the initial source of author and book data.
2. **Data mapping:** Sample JSON field names were mapped to the corresponding Prisma model fields. Enum values for book status, print partners, and publishing platforms were mapped to valid schema values where required.
3. **Authentication:** Protected endpoints require authentication. Unauthenticated requests should be rejected.
4. **Authorization:** Role-based middleware restricts administrative endpoints to admins.
5. **Author data isolation:** Authors should only be able to access books and other records belonging to their own author profile. Administrative access is controlled separately.
6. **Admin testing:** An existing test author account was assigned the `ADMIN` role for validating administrative features. This is a testing arrangement, not a production role-assignment workflow.
7. **Database configuration:** The application uses PostgreSQL through Prisma and relies on environment variables for database connectivity and other secrets.
8. **Seed repeatability:** The seed script uses upserts to help avoid duplicate users, authors, and books when rerun. Existing records may be updated when their unique lookup keys match.
9. **Test data:** Seeded data is intended for development and demonstration. Production credentials and data should be configured separately.

## 7. Security Considerations

- Secrets and database connection strings are stored in environment variables.
- Passwords should be stored as hashes, never as plaintext.
- Authentication and role checks are enforced on the backend rather than relying only on frontend route protection.
- Author-specific queries should enforce ownership at the database-query level.
- The admin role should only be assigned to authorized accounts.
- Test credentials should not be reused in production.

## 8. Testing Checklist

- [ ] Valid login succeeds.
- [ ] Invalid login is rejected.
- [ ] Unauthenticated requests to protected endpoints return `401 Unauthorized`.
- [ ] An author cannot access admin-only endpoints.
- [ ] An author cannot access another author's records.
- [ ] An admin can access authorized administrative functionality.
- [ ] Seeded book and author data appears correctly in the application.
- [ ] Publication status, sales, and royalty figures display correctly.
- [ ] Support ticket operations enforce the appropriate role and ownership restrictions.

## 9. Final Notes

This project was developed as a full-stack assignment to demonstrate frontend and backend integration, database modelling, authentication, authorization, data isolation, and the use of a supplied dataset.

For evaluation, use the configured test accounts and the provided sample data. Keep environment files and production credentials out of the repository.

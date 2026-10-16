## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Database Seeding and Test Accounts](#database-seeding-and-test-accounts)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)
- [Submission Notes](#submission-notes)
## Database Seeding and Test Accounts

The project includes a seed script that loads the assignment's supplied sample JSON dataset into the PostgreSQL database using Prisma.

### Seeding Behavior

- Creates or updates user accounts using their email addresses.
- Assigns seeded users the `AUTHOR` role and marks them as active.
- Creates or updates author profiles and their associated book records.
- Maps publishing statuses, print partners, and sales platforms from the supplied dataset to the corresponding database enum values.
- Uses Prisma upserts to create missing records or update existing records based on their unique identifiers.
- Executes the seeding operations inside a database transaction.

### Seeded Account Password

The seed script uses the `SEED_AUTHOR_PASSWORD` environment variable as the password for seeded author accounts. If this variable is not configured, the script falls back to `ChangeMe123!`.

The fallback is intended only for local development. Set a suitable value through your local environment before running the seed script. Never use this fallback password in a production environment.

### Admin Test Account

The supplied sample dataset does not include a dedicated admin account. To test admin-specific functionality, the role of one existing test user was temporarily changed from `AUTHOR` to `ADMIN` directly in the database.

This allowed testing of administrative ticket management and role-based access restrictions without changing the supplied sample dataset.

**Important:** The seed script assigns seeded users the `AUTHOR` role. Running it again will reset the role of seeded users to `AUTHOR`. Therefore, the admin test account must be configured separately after seeding if admin testing is required.

No real production user data or credentials should be used for this testing setup.

## Environment Variables

Configure the environment variables required by the backend and frontend using local `.env` files. Use `.env.example` files to document the required variable names without exposing credentials.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Secret used to verify and sign JWTs, if configured in the authentication implementation |
| `CLIENT_URL` | Frontend origin used for CORS and Socket.IO configuration |
| `PORT` | Backend listening port, if configurable |
| `SEED_AUTHOR_PASSWORD` | Optional password used for accounts created by the seed script |
| `VITE_API_URL` | Frontend API base URL, if used by the frontend |
| AI provider API key | Required only if the configured AI implementation uses an external provider |

The exact variable names and requirements must match the committed application code.

Do not commit `.env` files containing actual credentials, database passwords, JWT secrets, or private API keys. If a development fallback password exists in the seed script, replace it with an environment-provided value when running the script.

10. **Admin test-account setup:** The provided dataset does not contain a dedicated admin account. An existing test user's role was temporarily changed to `ADMIN` directly in the database to verify admin-only functionality. The seed script itself assigns seeded users the `AUTHOR` role.

11. **Repeatable seeding:** The seed script uses upserts for users, author profiles, and books. Existing records may be updated when seeding is run again. In particular, seeded user roles are reset to `AUTHOR`.

12. **Development-only credentials:** The seed script supports `SEED_AUTHOR_PASSWORD`. If the environment variable is absent, a fallback password is used for local development only. This fallback should not be used in production.

13. **Sample data preservation:** The supplied sample dataset is used for initial demonstration and testing. The seed script maps its publishing statuses, print partners, and platforms to the application's supported database values. Unknown mappings cause the seed process to fail rather than silently assigning an unsupported value.

## Submission Notes

- **Source Code:** [BookLeaf Support Portal](https://github.com/Harshitasinghbisht/bookleaf-support-portal)
- **Setup Instructions:** Documented in this README. Follow the environment configuration, database migration, and seeding instructions before starting the application.
- **Assumptions and Design Decisions:** Documented above, including the supplied sample dataset and the separate admin test-account setup.
- **Testing:** The table below records the test scenarios and their actual results. Only scenarios that were executed and verified are marked as passed.
- **Future Enhancements:** Listed separately and not presented as implemented functionality.

### Testing Performed

Update each result based on the tests actually executed.

| Test Scenario | Result |
|---|---|
| Login with valid credentials | [Record result] |
| Login with invalid credentials | [Record result] |
| Protected endpoint without authentication | [Record result] |
| Admin-only route restriction | [Record result] |
| Author data isolation | [Record result] |
| Support ticket creation and viewing | [Record result] |
| Ticket status updates | [Record result] |
| AI-assisted response drafting | [Record result] |
| Real-time ticket functionality | [Record result] |

This project was developed as part of a full-stack technical assignment. It focuses on authentication, role-based access control, author data ownership, support ticket management, and the integration of frontend and backend workflows.

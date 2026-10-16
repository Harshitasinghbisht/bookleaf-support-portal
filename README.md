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

<<<<<<< HEAD
Use the committed schema and migration files as the source of truth for the actual data model.

## Testing

The application should be checked for both successful operations and failure scenarios.

### Authentication and Authorization

- Valid credentials allow login.
- Invalid credentials are rejected.
- Protected endpoints reject unauthenticated requests.
- Users without the required role cannot access restricted endpoints.

### Data Isolation

- Authors can access their own books and tickets.
- Authors cannot retrieve another author's private records by changing a URL or request identifier.
- Administrators can access only the operations permitted by their role and the implemented policies.

### Ticket Workflow

- Valid ticket creation succeeds.
- Invalid or incomplete requests return appropriate errors.
- Ticket status changes follow the implemented workflow.
- Internal notes are not exposed as author-visible replies.

### Frontend and Integration

- Login and logout behave correctly.
- Protected navigation reflects the user's authentication state.
- Dashboard data comes from the backend.
- Loading, empty, and error states are handled appropriately.
- Real-time events work for the implemented workflows.

Run the available automated tests and production build commands before submission. The checks above describe the intended validation scope; report actual test results separately rather than treating this checklist as proof that every case has passed.

## Assumptions and Design Decisions

1. **Provided dataset:** The assignment's supplied sample JSON is treated as the reference dataset for initial demonstration and testing. Existing identifiers and relationships should be preserved where required by the assignment.

2. **Role separation:** The application distinguishes between authors and administrators. Role checks are enforced on the backend rather than relying solely on frontend navigation.

3. **Author data ownership:** Author-facing queries are scoped to the authenticated user to prevent cross-author data exposure.

4. **Nullable publishing data:** Missing production, sales, or royalty information is treated as unavailable rather than automatically interpreted as zero.

5. **Royalty calculations:** Royalty values are displayed according to the available data and the implemented calculation rules. No additional royalty formula is assumed unless specified by the assignment or application logic.

6. **AI-generated responses:** Suggested responses are drafts for review. The application should not imply that a generated draft has been sent unless the sending operation actually succeeds.

7. **AI fallback:** If the configured AI integration is unavailable or the application uses a template-based implementation, the fallback should be identified accurately. It should not be presented as a live language-model response.

8. **Demo environment:** Local development and demonstration data are not intended to represent production customer data.

9. **Scope:** Features are implemented according to the assignment requirements and the functionality available in the submitted codebase. Items listed as future enhancements are not represented as completed features.

## Known Limitations

Document only the limitations that apply to the submitted version. Potential areas to disclose include:

- AI response quality and availability depend on the configured implementation.
- Sample data is intended for demonstration and testing.
- Email notifications, production deployment hardening, or advanced analytics may not be included if they are outside the completed scope.
- Additional automated test coverage may be needed before production use.

## Future Enhancements

The following improvements could extend the application beyond the assignment's initial scope.

### 1. Production-Ready AI Integration

Integrate a production AI provider with structured output validation, retry handling, usage limits, and response-quality evaluation.

### 2. Email Notifications

Notify authors when tickets receive replies or their statuses change, and notify administrators when new tickets arrive.

### 3. Advanced Analytics

Provide reporting for ticket resolution time, ticket volume, publishing progress, sales trends, and royalty summaries.

### 4. Audit Logging

Maintain an audit trail of sensitive administrative actions, status changes, and updates to important records.

### 5. Expanded Automated Testing

Add unit, integration, and end-to-end tests covering authentication, role restrictions, data isolation, ticket workflows, and error handling.

### 6. Production Deployment and Monitoring

Add deployment automation, structured logging, monitoring, health checks, rate limiting, and stronger production security controls.

### 7. Improved Support Experience

Introduce ticket search, filtering, pagination, priorities, attachments, and configurable service-level targets where appropriate.
## Submission Notes

- **Source Code:** [BookLeaf Support Portal](https://github.com/Harshitasinghbisht/bookleaf-support-portal)
- **Setup Instructions:** See the installation, environment configuration, database setup, and run commands documented in this README.
- **Assumptions and Design Decisions:** Documented in the relevant sections above.
- **Testing:** Manual testing was performed for the scenarios listed below. Only checks actually executed should be marked as completed.
- **Future Enhancements:** Potential improvements are listed separately and are not presented as implemented features.

### Testing Performed

Record the results of the checks you actually ran:

| Test Scenario | Result |
|---|---|
| Login with valid credentials | [Pass/Not tested] |
| Login with invalid credentials | [Pass/Not tested] |
| Access protected routes without authentication | [Pass/Not tested] |
| Verify admin-only route restrictions | [Pass/Not tested] |
| Verify author data isolation | [Pass/Not tested] |
| Create and view support tickets | [Pass/Not tested] |
| Verify ticket status updates | [Pass/Not tested] |
| Verify AI-generated response drafts | [Pass/Not tested] |
| Verify real-time ticket functionality | [Pass/Not tested] |

This project was developed as part of a full-stack technical assignment. It focuses on authentication, role-based access control, author data isolation, support ticket management, and integration of relevant backend and frontend functionality.
=======
13. **Sample data preservation:** The supplied sample dataset is used for initial demonstration and testing. The seed script maps its publishing statuses, print partners, and platforms to the application's supported database values. Unknown mappings cause the seed process to fail rather than silently assigning an unsupported value.

## Submission Notes

- **Source Code:** [BookLeaf Support Portal](https://github.com/Harshitasinghbisht/bookleaf-support-portal)
- **Setup Instructions:** Documented in this README. Follow the environment configuration, database migration, and seeding instructions before starting the application.
- **Assumptions and Design Decisions:** Documented above, including the supplied sample dataset and the separate admin test-account setup.
- **Testing:** The table below records the test scenarios and their actual results. Only scenarios that were executed and verified are marked as passed.
- **Future Enhancements:** Listed separately and not presented as implemented functionality.

### Testing Performed
>>>>>>> 96da89c (feat: final cleanup)

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
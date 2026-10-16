# BookLeaf — Author & Publishing Support Portal

A full-stack web application designed to help authors track their books and publishing progress, monitor sales and royalties, and communicate with the publishing support team through a ticket-based workflow.

The application provides separate experiences for authors and administrators, with role-based access control, protected resources, and AI-assisted support operations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)

## Overview

BookLeaf is a publishing support portal that connects authors with the administrative team responsible for handling their queries.

Authors can access their own book information, review relevant publishing and royalty data, and raise support tickets. Administrators can manage incoming tickets, review author-related information, update ticket statuses, and prepare responses with AI-assisted functionality.

The application focuses on three important areas:

1. **Role-based access control:** Authors and administrators have different permissions and workflows.
2. **Data isolation:** Authors should only be able to access their own authorized resources.
3. **Support workflow:** Tickets can be managed through a structured process, with AI assistance to help streamline support operations.

## Key Features

### 1. Authentication and Authorization

- Login functionality with credential validation.
- Protected frontend routes for authenticated users.
- Role-based access control for `AUTHOR` and `ADMIN` roles.
- Server-side authorization checks for restricted operations.
- Ownership-based access restrictions for author resources.

### 2. Author Dashboard

- View books associated with the authenticated author.
- Review book publication statuses.
- Display available sales and royalty information.
- Access the support ticket workflow.
- Create support tickets for publishing-related queries.

### 3. Support Ticket Management

- Create and view support tickets.
- Track ticket status and related information.
- Allow administrators to manage tickets.
- Support ticket replies and internal administrative notes where implemented.
- Validate incoming requests and handle invalid or unauthorized operations.

### 4. Admin Workflow

- Access administrative ticket management functionality.
- Review and manage tickets across authors.
- Update ticket status and other supported ticket fields.
- Organize support operations through a centralized workflow.

### 5. AI-Assisted Support

- Generate suggested ticket classifications.
- Generate draft responses to author queries.
- Keep generated responses available for review before they are sent.
- Record relevant AI-processing information where implemented.

AI-generated content is intended to assist administrators, not replace human review. When a template-based fallback is used instead of a live AI model, the application should identify that behavior accurately.

### 6. Real-Time Functionality

- Socket.IO integration for supported real-time events.
- Real-time communication between connected clients for implemented workflows.
- Server-side event handling and client updates.

### 7. Data Persistence

- PostgreSQL database for application data.
- Prisma ORM for database access and schema management.
- Seed data based on the assignment's supplied sample dataset.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Application authentication middleware and role-based authorization |
| Real-time communication | Socket.IO |
| AI assistance | AI-assisted classification and response drafting, with a template fallback where configured |
| API testing | Postman or equivalent HTTP testing tools |
| Version control | Git and GitHub |

## Application Architecture

The application follows a client-server architecture.

**Frontend:** Handles the user interface, authentication state, protected navigation, forms, dashboard views, ticket management, and API communication.

**Backend:** Exposes API endpoints, validates incoming requests, authenticates users, enforces authorization rules, and coordinates business logic.

**Database:** Stores application records, including users, books, tickets, and related entities according to the Prisma schema.

**Real-time layer:** Socket.IO supports the real-time events implemented by the application.

**AI service layer:** Generates suggested classifications or draft responses through the configured provider or fallback implementation.

The backend remains responsible for enforcing permissions. Hiding a button or restricting a frontend route alone is not considered sufficient authorization.

## Prerequisites

Before running the application, install or arrange the following:

- Node.js and npm.
- Access to a PostgreSQL database.
- Git.
- A modern web browser.
- An AI provider API key only if the live AI integration requires one.

Check the project's Node.js requirements and package configuration before selecting a Node.js version.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Harshitasinghbisht/bookleaf-support-portal/
cd bookleaf_assignment
```

### 2. Install dependencies

Install dependencies separately for the backend and frontend.

```bash
cd backend
npm install
```

Then, from the repository root or the actual frontend directory:

```bash
cd frontend
npm install
```

Adjust directory names to match the repository structure.

### 3. Configure environment variables

Create the required `.env` files using the provided `.env.example` files, if available.

Configure the database connection, authentication secret, frontend API URL, and any additional settings required by the project.

Do not commit actual secrets, database passwords, or private API keys.

### 4. Prepare the database

Ensure PostgreSQL is accessible and the configured database exists.

Generate the Prisma client and apply the project's database schema or migrations using the commands supported by the installed Prisma version and project configuration.

For example, a project using Prisma migrations may require:

```bash
npx prisma generate
npx prisma migrate deploy
```

Run these commands from the backend directory if that is where the Prisma configuration is located. Use the project's actual migration and seeding workflow.

If the repository provides a seed command, run it to load the supplied assignment data.

### 5. Start the backend

From the backend directory, use the development script defined in `package.json`.

```bash
npm run dev
```

### 6. Start the frontend

In a separate terminal, navigate to the frontend directory and run:

```bash
npm run dev
```

Vite will display the local development URL in the terminal. Open that URL in your browser.

**Important:** The exact directory names, scripts, environment variable names, and migration commands must match the committed project. Refer to the actual `package.json`, Prisma configuration, and environment example files.

## Environment Variables

The following table describes typical configuration values. Use the exact names expected by the application in the committed `.env.example` files.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used by JWT-based authentication, if applicable |
| `PORT` | Backend server port |
| `CLIENT_URL` | Frontend origin used for CORS or related configuration |
| `VITE_API_URL` | Backend API base URL used by the frontend, if configured |
| AI provider key | Credentials for the configured AI provider, if required |

Never publish production credentials or real user data in the repository.

## Database Setup

The database schema is managed using Prisma and PostgreSQL.

The setup process should include:

1. Configure a valid PostgreSQL connection string.
2. Generate the Prisma client.
3. Apply committed migrations or the documented schema initialization command.
4. Load the provided sample dataset using the project's seed script, if available.
5. Verify that the backend can connect to the database.

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


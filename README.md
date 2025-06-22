# Claimly

(Continuation of an interview coding challenge)

A mobile application for claiming work shifts, built with React Native (Expo) and a Hono backend.

## Prerequisites

Before you begin, ensure you have [Bun](https://bun.sh/) installed on your system.

## Getting Started

Follow these steps to get the project up and running in your local development environment.

### 1. Backend Setup

First, navigate to the `backend` directory, install dependencies, and start the development server.

```bash
cd backend
bun install
bun run dev
```

The backend server will start on port `3001`.

### 2. Frontend Setup

In a separate terminal, navigate to the `claimly` directory (the frontend app), install dependencies, and start the development server.

```bash
cd claimly
bun install
bun run dev
```

This will start the Expo development server. You can then run the app on an emulator/simulator or on a physical device using the Expo Go app.

## Mock Data & Test Users

The project includes a pre-populated SQLite database (`backend/local.db`) with mock data, including test users. You can use the following credentials to log in:

- **Test User**:

  - **Email**: `testuser1@example.com`
  - **Password**: `Test1234!`

- **Test Admin**:
  - **Email**: `testadmin1@example.com`
  - **Password**: `Test1234!`

## Available Scripts

### Backend (`backend/package.json`)

- `bun run dev`: Starts the backend development server with hot-reloading.
- `bun run db:push`: Pushes schema changes to the database.
- `bun run db:generate`: Generates database migration files.
- `bun run db:studio`: Opens the Drizzle Studio to inspect the database.

### Frontend (`claimly/package.json`)

- `bun run dev`: Starts the Expo development server.
- `bun run dev:android`: Starts the Expo server and attempts to launch the app on a connected Android device or emulator.
- `bun run dev:ios`: Starts the Expo server and attempts to launch the app on an iOS simulator.
- `bun run dev:web`: Starts the Expo server and attempts to launch the app in a web browser.
- `bun run clean`: Removes `node_modules` and the `.expo` cache directory.

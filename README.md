# Mutual Funds Tracker

A web application to track mutual fund investments, contributions, and transactions.

## Prerequisites

- Node.js (v18 or newer)
- pnpm (v7 or newer)

## Installation

1. Clone the repository
2. Install dependencies with pnpm:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_lHG3DzwEC6fQ@ep-autumn-mud-a4qeek5r-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

After starting the development server, initialize the database by accessing the setup endpoint:

```
http://localhost:3000/api/setup
```

This will create the necessary database tables if they don't already exist:

- `funds` - Stores mutual fund information
- `transactions` - Records fund transactions
- `contributions` - Tracks monetary contributions
- `friends` - Manages individuals contributing to funds

## Application Features

The application allows you to:

1. Track multiple mutual funds with their ticker symbols and prices
2. Record transactions (buy/sell) for each fund
3. Manage contributions from different individuals
4. View a dashboard with summary statistics
5. Generate reports and visualizations of fund performance

## Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

- `app/` - Next.js pages and API routes
  - `page.tsx` - Main dashboard
  - `funds/` - Fund management
  - `transactions/` - Transaction management
  - `contributions/` - Contribution management
  - `friends/` - Friend management
  - `api/` - Backend API endpoints
- `components/` - Reusable UI components
- `lib/` - Utility functions and database configuration
- `public/` - Static assets
- `styles/` - Global stylesheets

## Technology Stack

- Next.js - React framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Neon Database - PostgreSQL database service
- Radix UI - Accessible React UI components

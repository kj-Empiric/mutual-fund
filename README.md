Here’s an enhanced and polished version of your `README.md` file with improved formatting, better readability, and a more professional structure that will look great on GitHub.  

***

# Mutual Funds Tracker

A web application to track **mutual fund investments, contributions, and transactions** with a clean dashboard and reporting tools.

***

## 🚀 Features

- Track multiple mutual funds by ticker symbols and prices  
- Record transactions (buy/sell) for each fund  
- Manage contributions from different individuals  
- View a dashboard with summary statistics  
- Generate reports and visualizations of fund performance  

***

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) **v18+**  
- [pnpm](https://pnpm.io/) **v7+**

***

## ⚙️ Installation

1. Clone the repository  

   ```bash
   git clone https://github.com/your-username/mutual-funds-tracker.git
   cd mutual-funds-tracker
   ```

2. Install dependencies  

   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory and add your database URL:  

   ```
   DATABASE_URL=postgresql://neondb_owner:npg_lHG3DzwEC6fQ@ep-autumn-mud-a4qeek5r-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

***

## 🖥️ Development

Start the development server:

```bash
pnpm dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

***

## 🗃️ Database Setup

Once the development server is running, initialize the database by visiting:

```
http://localhost:3000/api/setup
```

This will automatically create the required tables if they don’t already exist:

- `funds` → Stores mutual fund information  
- `transactions` → Records buy/sell transactions  
- `contributions` → Tracks monetary contributions  
- `friends` → Manages individuals contributing to funds  

***

## 📦 Build for Production

Build and run in production mode:

```bash
pnpm build
pnpm start
```

***

## 📁 Project Structure

```
├── app/                # Next.js pages and API routes
│   ├── page.tsx        # Main dashboard
│   ├── funds/          # Fund management
│   ├── transactions/   # Transaction management
│   ├── contributions/  # Contribution management
│   ├── friends/        # Friend management
│   └── api/            # Backend API endpoints
│
├── components/         # Reusable UI components
├── lib/                # Utility functions and database config
├── public/             # Static assets
├── styles/             # Global stylesheets
└── README.md
```

***

## 🛠️ Technology Stack

- [Next.js](https://nextjs.org/) – React framework  
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework  
- [Neon Database](https://neon.tech/) – PostgreSQL serverless database  
- [Radix UI](https://www.radix-ui.com/) – Accessible React UI components  

***

## 📌 Future Improvements (Planned)

- Add authentication and user profiles  
- Enable live fund price tracking via APIs  
- Export reports in PDF/Excel formats  
- Add collaboration features for group investments  

***
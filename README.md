# Bragster

A website made as a sort of webpage where I can put any crazy ideas that come to mind. Right now its only functionality is a modern receipt management and sharing system. Effortlessly split bills using AI!

🌐 **Live Site**: [https://bragster.vercel.app](https://bragster.vercel.app)

## Features

- 📸 **Receipt Scanning**: Automatically extract data from receipts using AI
- 📋 **Receipt Management**: Organize and track all your receipts in one place
- 🤝 **Smart Receipts**: Split bills and share receipts with others
- 🔐 **Secure Authentication**: Built-in authentication system
- 💰 **Multi-Currency Support**: Handle receipts in different currencies and languages

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended package manager)
- **PostgreSQL** (or another database supported by Prisma)

You'll also need:
- An Azure account for Form Recognizer API (optional, for receipt scanning)
- Database connection string

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bragster
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/bragster"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Azure Form Recognizer (optional)
   AZURE_FORM_RECOGNIZER_ENDPOINT="your-azure-endpoint"
   AZURE_FORM_RECOGNIZER_KEY="your-azure-key"
   ```

4. **Set up the database**
   
   Run Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev --schema=./src/prisma/schema.prisma
   ```
   
   Generate Prisma client:
   ```bash
   pnpm run prisma-generate
   ```

## How to Run

### Development Mode

Start the development server:
```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

### Storybook (Component Development)

Run Storybook for component development and testing:
```bash
pnpm storybook
```

Storybook will be available at [http://localhost:6006](http://localhost:6006)

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm storybook` - Start Storybook for component development
- `pnpm build-storybook` - Build Storybook static site
- `pnpm prisma-generate` - Generate Prisma client
- `pnpm lint` - Run linter
- `pnpm lint:fix` - Fix linting issues automatically

## Database Migrations

To create a new database migration:

```bash
npx prisma migrate dev --name your_migration_name --schema=./src/prisma/schema.prisma
pnpm run prisma-generate
```

## Project Structure

- `/src/app` - Next.js app directory with routes and pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility libraries and shared logic
- `/src/prisma` - Database schema and migrations
- `/src/types` - TypeScript type definitions
- `/src/utils` - Helper functions and utilities

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI
- **State Management**: TanStack Query
- **AI/ML**: Azure AI Form Recognizer
- **Form Handling**: React Hook Form + Zod

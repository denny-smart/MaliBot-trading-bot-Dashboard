# R_25 Trading Bot

## Project info

Automated trading dashboard for the R_25 Trading Bot system.

## Features

- Real-time bot status monitoring
- Live trading dashboard
- Trade history and analytics
- Performance metrics
- Signal monitoring

## How to run

1. Install dependencies: `npm install` or `bun install`
2. Start development server: `npm run dev` or `bun dev`
3. Build for production: `npm run build` or `bun build`

## API Integration

The frontend connects to the R_25 Trading Bot backend API at:
- Base URL: `https://r-25v1.onrender.com`
- Bot Status: `/api/v1/bot/status`
- Active Trades: `/api/v1/trades/active`
- Trade History: `/api/v1/trades/history`
- Trading Signals: `/api/v1/monitor/signals`

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
``

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


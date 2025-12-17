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
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

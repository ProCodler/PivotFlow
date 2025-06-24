# PivotFlow

## Revolutionizing Digital Asset Management on the Internet Computer

PivotFlow is a next-generation platform designed to empower users, investors, and organizations to seamlessly manage, monitor, and optimize their digital asset portfolios on the Internet Computer (IC). Built with a modern tech stack and a focus on usability, security, and actionable insights, PivotFlow bridges the gap between blockchain complexity and user-friendly portfolio management.

---

## 🚀 Why PivotFlow?

- **Unified Dashboard:** View all your IC assets, NFTs, and canister activity in one place.
- **Real-Time Analytics:** Get up-to-date blockchain fees, portfolio performance, and market trends.
- **NFT Alerts:** Never miss an opportunity—set custom alerts for NFT events and price changes.
- **Seamless Integration:** Connect with IC wallets and canisters effortlessly.
- **Open & Extensible:** Built for developers and power users to extend and integrate.

---

## ✨ Key Features

- **Portfolio Overview:** Visualize your holdings, allocations, and performance over time.
- **Live Market Data:** Real-time cryptocurrency prices from CoinGecko API integration.
- **Gas Price Monitoring:** Track Ethereum, Polygon, BNB Chain, and Solana transaction costs.
- **NFT Floor Price Tracking:** Monitor OpenSea collection floor prices with custom alerts.
- **Blockchain Fee Tracker:** Optimize transaction timing with live gas price data.
- **NFT Alerts & Watchlists:** Stay ahead with customizable notifications for price changes.
- **User Profiles:** Personalize your experience and manage multiple accounts with Internet Identity.
- **Settings & Customization:** Tailor the platform to your workflow.
- **Admin Dashboard:** Canister metrics and cycle management for operators.
- **Real-time Updates:** Live data synchronization with external APIs every 60 seconds.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** Motoko canisters on the Internet Computer
- **State Management:** React Context API with custom data service layer
- **UI Components:** Custom shadcn/ui-inspired components with modern design
- **IC Integration:** @dfinity/agent, @dfinity/auth-client for Internet Identity
- **Live Data APIs:** 
  - CoinGecko API for cryptocurrency prices
  - OpenSea API for NFT collection data
  - Multiple gas tracking APIs (EthGasStation, GasNow, Polygon Gas Station)
- **Real-time Updates:** Automated data synchronization with caching layer
- **Development Tools:** dfx, TypeScript declarations generation, automated setup

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install) (v0.15.0+)

### Automated Setup

The fastest way to get started is using our setup script:

```bash
# Clone the repo
git clone https://github.com/your-org/PivotFlow.git
cd PivotFlow

# Run the automated setup script
./setup.sh
```

This script will:
- Install all dependencies
- Start the local IC replica
- Deploy Internet Identity
- Deploy PivotFlow canisters
- Generate TypeScript declarations
- Set up environment variables
- Provide access URLs

### Manual Setup

If you prefer to set up manually:

```bash
# Install dependencies
npm install

# Start the IC replica (in a separate terminal)
dfx start --background

# Deploy Internet Identity
dfx deploy internet_identity

# Deploy PivotFlow canisters
dfx deploy

# Generate TypeScript declarations
dfx generate

# Start the frontend development server
npm run dev
```

### Development URLs
- **Frontend Dev Server**: http://localhost:3000
- **Frontend Canister**: http://localhost:4943/?canisterId={frontend-canister-id}
- **IC Local Replica**: http://localhost:4943

### Live Data Integration

For full functionality with live market data, add API keys to `.env.local`:

```bash
# API Keys for live data
VITE_OPENSEA_API_KEY=your_opensea_api_key
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run setup        # Run automated setup
npm run deploy       # Deploy canisters
npm run generate     # Generate TypeScript declarations
npm run canister:start    # Start dfx in background
npm run canister:stop     # Stop dfx
npm run canister:logs     # View backend logs
```

---

## 🖥️ Usage & Screenshots

> _Add screenshots or GIFs here to showcase the dashboard, NFT alerts, and analytics._

---

## 🧩 Project Structure

- `src/` — Main frontend source code
  - `components/` — UI components (Button, Card, Tabs, etc.)
  - `pages/` — Main app pages (Dashboard, Portfolio, NFT Alerts, etc.)
  - `contexts/` — React context providers (Auth, App, ICP)
  - `lib/` — Utility functions and IC integration
- `PivotFlow_backend/` — Motoko canister code
- `PivotFlow_frontend/` — Frontend app (if using monorepo structure)

---

## 🤝 Contributing

We welcome contributions! Please open issues, submit pull requests, or suggest features. See `CONTRIBUTING.md` for guidelines.

---

## 📄 License

MIT License. See `LICENSE` for details.

---

## 📣 Contact & Pitch

PivotFlow is the all-in-one solution for digital asset management on the Internet Computer. Whether you're an individual investor, NFT collector, or organization, PivotFlow gives you the tools to make smarter decisions, faster.

- **Contact:** [your.email@domain.com](mailto:your.email@domain.com)
- **Website:** [https://pivotflow.app](https://pivotflow.app)
- **Demo:** _Available upon request_

> _Ready to unlock the full potential of your digital assets? Try PivotFlow today!_

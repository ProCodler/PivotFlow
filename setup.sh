#!/bin/bash

# PivotFlow Setup and Deployment Script

set -e

echo "🚀 PivotFlow - Setting up development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    print_error "dfx is not installed. Please install the DFINITY Canister SDK first."
    echo "Visit: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v18+ recommended)."
    exit 1
fi

print_status "Checking dfx version..."
dfx --version

print_status "Checking Node.js version..."
node --version

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Start dfx if not already running
if ! dfx ping &> /dev/null; then
    print_status "Starting dfx local replica in background..."
    dfx start --background --clean
    
    # Wait for dfx to start
    echo "Waiting for dfx to start..."
    sleep 5
    
    # Verify dfx is running
    if ! dfx ping &> /dev/null; then
        print_error "Failed to start dfx. Please check your setup."
        exit 1
    fi
    
    print_success "dfx local replica started successfully!"
else
    print_success "dfx is already running!"
fi

# Setup Internet Identity dependencies
print_status "Setting up Internet Identity dependencies..."
if ! dfx canister id internet_identity &> /dev/null; then
    print_status "Installing Internet Identity dependency..."
    
    # Pull dependencies
    if dfx deps pull; then
        print_success "Dependencies pulled successfully!"
    else
        print_warning "Failed to pull dependencies, trying alternative approach..."
    fi
    
    # Initialize Internet Identity dependency
    if dfx deps init internet_identity --argument null; then
        print_success "Internet Identity initialized!"
    else
        print_warning "Failed to initialize Internet Identity dependency"
    fi
    
    # Deploy Internet Identity
    print_status "Deploying Internet Identity locally..."
    if dfx deps deploy; then
        print_success "Internet Identity deployed successfully!"
    else
        print_error "Failed to deploy Internet Identity. Continuing without it..."
        print_warning "You may need to deploy Internet Identity manually later."
    fi
else
    print_success "Internet Identity already deployed!"
fi

# Deploy PivotFlow backend
print_status "Deploying PivotFlow backend canister..."
dfx deploy PivotFlow_backend --mode=reinstall

# Get canister IDs
BACKEND_CANISTER_ID=$(dfx canister id PivotFlow_backend)

# Try to get Internet Identity canister ID (might fail if not deployed)
if dfx canister id internet_identity &> /dev/null; then
    II_CANISTER_ID=$(dfx canister id internet_identity)
    print_success "Internet Identity canister ID: $II_CANISTER_ID"
else
    II_CANISTER_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"  # Local default
    print_warning "Using default Internet Identity canister ID: $II_CANISTER_ID"
fi

print_success "Backend deployed with canister ID: $BACKEND_CANISTER_ID"

# Update environment variables
print_status "Updating environment variables..."
cat > .env.local << EOF
# Local development environment variables
VITE_DFX_NETWORK=local
VITE_PIVOTFLOW_BACKEND_CANISTER_ID=$BACKEND_CANISTER_ID
VITE_INTERNET_IDENTITY_CANISTER_ID=$II_CANISTER_ID

# API Keys (add your own)
VITE_OPENSEA_API_KEY=
VITE_COINGECKO_API_KEY=
VITE_ETHERSCAN_API_KEY=

# Network configuration
VITE_IC_HOST=http://localhost:4943
VITE_II_URL=http://localhost:4943?canisterId=$II_CANISTER_ID
EOF

print_success "Environment variables updated!"

# Generate declarations
print_status "Generating TypeScript declarations..."
dfx generate PivotFlow_backend

# Install frontend dependencies (in case they changed)
print_status "Installing/updating frontend dependencies..."
cd src/PivotFlow_frontend && npm install && cd ../..

# Build frontend
print_status "Building frontend..."
npm run build

# Deploy frontend
print_status "Deploying frontend canister..."
dfx deploy PivotFlow_frontend

# Get frontend canister ID
FRONTEND_CANISTER_ID=$(dfx canister id PivotFlow_frontend)

print_success "Frontend deployed with canister ID: $FRONTEND_CANISTER_ID"

# Display access URLs
echo ""
echo "🎉 ${GREEN}PivotFlow deployed successfully!${NC}"
echo ""
echo "📍 ${BLUE}Access URLs:${NC}"
echo "   Frontend: http://localhost:4943/?canisterId=$FRONTEND_CANISTER_ID"
echo "   Local frontend dev: http://localhost:3000 (run 'npm run dev')"
echo "   Backend canister: $BACKEND_CANISTER_ID"
echo "   Internet Identity: $II_CANISTER_ID"
echo ""
echo "🔧 ${BLUE}Development commands:${NC}"
echo "   Start frontend dev server: npm run dev"
echo "   Redeploy backend: dfx deploy PivotFlow_backend"
echo "   View canister logs: dfx logs PivotFlow_backend"
echo "   Stop dfx: dfx stop"
echo ""
echo "🔑 ${BLUE}API Configuration:${NC}"
echo "   Add your API keys to .env.local for live data:"
echo "   - OpenSea API key for NFT data"
echo "   - CoinGecko API key for crypto prices"
echo "   - Etherscan API key for gas prices"
echo ""
echo "💡 ${YELLOW}Next steps:${NC}"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Open http://localhost:3000 in your browser"
echo "   3. Connect with Internet Identity to test features"
echo "   4. Set up API keys for live data integration"
echo ""

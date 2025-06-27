#!/bin/bash

# Telegram Testing Script for PivotFlow
# Test user: dr_winner

echo "🧪 Testing Telegram Integration for user: dr_winner"
echo "=================================================="

# Check if .env file exists
if [ ! -f "src/PivotFlow_frontend/.env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please ensure src/PivotFlow_frontend/.env contains VITE_TELEGRAM_BOT_TOKEN"
    exit 1
fi

# Check if bot token is set
if grep -q "VITE_TELEGRAM_BOT_TOKEN=" src/PivotFlow_frontend/.env; then
    echo "✅ Telegram bot token found in .env"
else
    echo "❌ Error: VITE_TELEGRAM_BOT_TOKEN not found in .env"
    exit 1
fi

# Get the bot token
BOT_TOKEN=$(grep "VITE_TELEGRAM_BOT_TOKEN=" src/PivotFlow_frontend/.env | cut -d'=' -f2)

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Error: Bot token is empty"
    exit 1
fi

echo "🤖 Bot token configured (${BOT_TOKEN:0:10}...)"

# Test bot connectivity
echo "🔄 Testing bot connectivity..."
RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Bot is active: @$BOT_NAME"
else
    echo "❌ Bot connectivity test failed"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "📱 Manual Testing Steps for 'dr_winner':"
echo "1. Open Telegram and search for @$BOT_NAME"
echo "2. Start a conversation with the bot"
echo "3. Send any message to activate the chat"
echo "4. Open PivotFlow at http://localhost:3000"
echo "5. Go to Settings page"
echo "6. Enter 'dr_winner' as the Chat ID"
echo "7. Click 'Test Telegram Connection'"
echo "8. Check Telegram for the test message"
echo ""
echo "🎯 Expected Result:"
echo "- Test notification should be sent to @dr_winner"
echo "- All notification toggles should be functional"
echo "- Settings should save properly"
echo ""
echo "🚀 PivotFlow is ready for testing!"
echo "Open: http://localhost:3000"

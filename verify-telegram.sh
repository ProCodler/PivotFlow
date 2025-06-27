#!/bin/bash

echo "🧪 PivotFlow Telegram Integration Verification"
echo "============================================="

# Get bot token from .env
BOT_TOKEN=$(grep "VITE_TELEGRAM_BOT_TOKEN=" src/PivotFlow_frontend/.env | cut -d'=' -f2)

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Bot token not found in .env file"
    exit 1
fi

echo "✅ Bot token loaded: ${BOT_TOKEN:0:10}..."

# Test bot status
echo "🤖 Testing bot connectivity..."
RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    BOT_NAME=$(echo "$RESPONSE" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Bot active: @$BOT_USERNAME ($BOT_NAME)"
else
    echo "❌ Bot test failed: $RESPONSE"
    exit 1
fi

echo ""
echo "📱 Instructions for dr_winner:"
echo "1. Open Telegram app"
echo "2. Search for: @$BOT_USERNAME"
echo "3. Send any message (like 'hello') to start the chat"
echo "4. Go to PivotFlow Settings: http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/"
echo "5. Enter 'dr_winner' OR your actual Telegram chat ID in the field"
echo "6. Click 'Test Telegram Connection'"
echo ""
echo "🔍 Note: If 'dr_winner' doesn't work, you may need to use your numeric chat ID"
echo "To get your chat ID, send a message to the bot, then visit:"
echo "https://api.telegram.org/bot$BOT_TOKEN/getUpdates"
echo ""
echo "🎯 Ready for testing!"
echo "Main App: http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/"
echo "Dev Server: http://localhost:3000"

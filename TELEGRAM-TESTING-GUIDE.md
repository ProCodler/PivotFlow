# Telegram Integration Testing Guide 🧪

## 🚀 How to Test the Telegram Integration

### **Step 1: Start the Application**
```bash
# Navigate to the frontend directory
cd /home/ubuntu/Desktop/PivotFlow/src/PivotFlow_frontend

# Start the development server
npm run dev
```

### **Step 2: Access PivotFlow**
Open your browser and go to: **http://localhost:3000**

### **Step 3: Test Telegram Setup**

#### **3.1 Get Your Telegram Chat ID**
1. Open Telegram
2. Start a chat with **@userinfobot**
3. Send any message (like "hi")
4. Copy your **Chat ID** from the response (e.g., `123456789`)

#### **3.2 Configure in PivotFlow**
1. In the PivotFlow app, click **Settings** in the navigation
2. Click the **Notifications** tab
3. You should see:
   - ✅ **Telegram Bot Status: Connected** (green checkmark)
   - Bot Name and Username displayed
   - Instructions for getting Chat ID

#### **3.3 Test Notification**
1. Paste your Chat ID in the input field
2. Click the **"Test"** button
3. Check your Telegram - you should receive:

```
🔵 ⚡ PivotFlow - Cycles Alert

Test Notification
This is a test message from PivotFlow! Your Telegram notifications are working correctly.

Blockchain: ∞ Internet Computer
Time: [current timestamp]

🌐 Powered by ICP Chain Fusion Technology
```

### **Step 4: Test Real Alerts**

#### **4.1 Create a Cycles Alert**
1. Go to **Blockchain Fees** page
2. Click **"+ Add Cycles Alert"**
3. Set operation type: **"Canister Call"**
4. Set max cycles: **500,000**
5. Click **"Add Alert"**
6. You should receive a notification about the alert being created

#### **4.2 Create an NFT Alert**
1. Go to **NFT Alerts** page
2. Click **"Add Alert"**
3. Enter collection: **"Bored Ape Yacht Club"**
4. Set target price: **10 ICP**
5. Select **"Drop Below"**
6. Click **"Create Alert"**
7. You should receive a confirmation notification

#### **4.3 Test Portfolio Updates**
1. Go to **Portfolio** page
2. Add a wallet address (any format)
3. Click **"Refresh Portfolio"**
4. You should receive a portfolio summary notification

## 🎯 Expected Test Results

### **Telegram Bot Connection:**
- ✅ Bot status shows "Connected"
- ✅ Bot info displays: Name and Username
- ✅ Test button sends notification successfully

### **Notification Formats:**
All notifications should include:
- 🎨 **Rich formatting** with emojis and priorities
- ∞ **ICP branding** with Internet Computer symbol
- 🔗 **Chain Fusion** emphasis in footer
- 📊 **Structured data** (blockchain, amount, time)

### **Alert Types Working:**
- ⚡ **Cycles Alerts** - ICP operation cost monitoring
- 🎨 **NFT Alerts** - Floor price notifications
- 💰 **Portfolio Updates** - Balance and performance tracking
- 🔗 **Chain Fusion Alerts** - Cross-chain operation updates

## 🔧 Troubleshooting

### **If Bot Shows "Disconnected":**
- Check that `.env` file exists with `VITE_TELEGRAM_BOT_TOKEN`
- Verify bot token is correct
- Restart dev server (`npm run dev`)

### **If Test Message Fails:**
- Double-check Chat ID format (should be numbers only)
- Make sure you have an active Telegram account
- Verify bot token in environment variables

### **If No Notifications Received:**
- Check Telegram spam folder
- Verify Chat ID is correct
- Look for console errors in browser dev tools

## 📱 Sample Notification Types

### **Cycles Alert:**
```
🔴 ⚡ PivotFlow - Cycles Alert

Cycles Threshold Exceeded
Operation "Canister Call" cost 1,200,000 cycles, exceeding your threshold of 500,000 cycles.

Blockchain: ∞ Internet Computer
Amount: 1,200,000 cycles
Time: 6/25/2025, 3:30:22 PM

🌐 Powered by ICP Chain Fusion Technology
```

### **NFT Alert:**
```
🟡 🎨 PivotFlow - NFT Alert

Bored Ape Yacht Club Price Alert
Floor price has dropped below your target of 10 ICP.

Current floor price: 8.5 ICP
Blockchain: ∞ Internet Computer
Amount: 8.5 ICP
Time: 6/25/2025, 3:30:22 PM

🌐 Powered by ICP Chain Fusion Technology
```

### **Chain Fusion Alert:**
```
🟡 🔗 PivotFlow - Chain Fusion Alert

Chain Fusion Bitcoin Transfer
✅ Transfer from Bitcoin to Internet Computer

Status: COMPLETED
Blockchain: ₿ Bitcoin → ∞ Internet Computer
Amount: 0.001 ckBTC
Time: 6/25/2025, 3:30:22 PM

🌐 Powered by ICP Chain Fusion Technology
```

## ✅ Success Criteria

The Telegram integration is working correctly if:
- ✅ Bot connection status shows "Connected"
- ✅ Test notification is received in Telegram
- ✅ Messages are formatted with ICP branding
- ✅ All notification types can be triggered
- ✅ Notification history shows in Settings tab

## 🎉 Ready for Production!

Once all tests pass, your PivotFlow users will have:
- **Real-time ICP alerts** delivered instantly to Telegram
- **Beautiful formatting** that showcases Chain Fusion technology
- **Multiple notification types** for comprehensive monitoring
- **Secure configuration** with environment variables

*Happy Testing! 🧪📱*

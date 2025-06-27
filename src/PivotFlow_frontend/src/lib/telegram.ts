import React from 'react';

// Telegram Bot Configuration from environment
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';

// Validate that the bot token is configured
if (!TELEGRAM_BOT_TOKEN) {
  console.warn('Telegram bot token not found in environment variables. Please set VITE_TELEGRAM_BOT_TOKEN in your .env file.');
}

export interface TelegramMessage {
  text: string;
  chatId: string;
  parseMode?: 'HTML' | 'Markdown';
  disableWebPagePreview?: boolean;
}

export interface NotificationPayload {
  type: 'cycles_alert' | 'nft_alert' | 'portfolio_update' | 'chain_fusion_alert';
  title: string;
  message: string;
  blockchain?: string;
  amount?: number;
  currency?: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

class TelegramNotificationService {
  private botToken: string;
  private apiUrl: string;

  constructor(botToken?: string) {
    this.botToken = botToken || TELEGRAM_BOT_TOKEN;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken) {
      console.error('Telegram bot token is required. Please set VITE_TELEGRAM_BOT_TOKEN in your .env file.');
    }
  }

  // Send a basic text message
  async sendMessage(chatId: string, text: string, options?: {
    parseMode?: 'HTML' | 'Markdown';
    disableWebPagePreview?: boolean;
  }): Promise<boolean> {
    if (!this.botToken) {
      console.error('Cannot send message: Telegram bot token not configured');
      return false;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: options?.parseMode || 'HTML',
          disable_web_page_preview: options?.disableWebPagePreview || false,
        }),
      });

      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  // Send a formatted notification
  async sendNotification(chatId: string, notification: NotificationPayload): Promise<boolean> {
    const formattedMessage = this.formatNotificationMessage(notification);
    return await this.sendMessage(chatId, formattedMessage, { parseMode: 'HTML' });
  }

  // Format notification message with ICP/Chain Fusion branding
  private formatNotificationMessage(notification: NotificationPayload): string {
    const { type, title, message, blockchain, amount, currency, priority } = notification;
    const timestamp = new Date(notification.timestamp).toLocaleString();
    
    // Priority emojis
    const priorityEmoji = {
      low: '🔵',
      medium: '🟡', 
      high: '🔴'
    }[priority];

    // Type-specific emojis and styling
    const typeConfig = {
      cycles_alert: { emoji: '⚡', color: '#00D4FF', name: 'Cycles Alert' },
      nft_alert: { emoji: '🎨', color: '#9333EA', name: 'NFT Alert' },
      portfolio_update: { emoji: '💰', color: '#059669', name: 'Portfolio Update' },
      chain_fusion_alert: { emoji: '🔗', color: '#F59E0B', name: 'Chain Fusion Alert' }
    };

    const config = typeConfig[type];
    
    let formattedMessage = `
<b>${priorityEmoji} ${config.emoji} PivotFlow - ${config.name}</b>

<b>${title}</b>
${message}
`;

    // Add blockchain and amount info if available
    if (blockchain) {
      const blockchainEmoji = {
        'Internet Computer': '∞',
        'Bitcoin': '₿',
        'Ethereum': '⧫',
        'ckBTC': '₿',
        'ckETH': '⧫'
      }[blockchain] || '🔗';
      
      formattedMessage += `\n<b>Blockchain:</b> ${blockchainEmoji} ${blockchain}`;
    }

    if (amount && currency) {
      formattedMessage += `\n<b>Amount:</b> ${amount.toLocaleString()} ${currency}`;
    }

    formattedMessage += `\n<b>Time:</b> ${timestamp}`;
    
    // Add Chain Fusion branding
    formattedMessage += `\n\n<i>🌐 Powered by ICP Chain Fusion Technology</i>`;

    return formattedMessage;
  }

  // Send cycles alert
  async sendCyclesAlert(chatId: string, data: {
    operationType: string;
    cyclesCost: number;
    threshold: number;
    canisterId?: string;
  }): Promise<boolean> {
    const notification: NotificationPayload = {
      type: 'cycles_alert',
      title: 'Cycles Threshold Exceeded',
      message: `Operation "${data.operationType}" cost ${data.cyclesCost.toLocaleString()} cycles, exceeding your threshold of ${data.threshold.toLocaleString()} cycles.${data.canisterId ? `\n\nCanister: ${data.canisterId}` : ''}`,
      blockchain: 'Internet Computer',
      amount: data.cyclesCost,
      currency: 'cycles',
      timestamp: Date.now(),
      priority: data.cyclesCost > data.threshold * 2 ? 'high' : 'medium'
    };

    return await this.sendNotification(chatId, notification);
  }

  // Send NFT alert
  async sendNftAlert(chatId: string, data: {
    collectionName: string;
    floorPrice: number;
    targetPrice: number;
    currency: string;
    alertType: 'drop_below' | 'rise_above' | 'any_change';
    blockchain: string;
  }): Promise<boolean> {
    const actionText = {
      drop_below: 'dropped below',
      rise_above: 'risen above', 
      any_change: 'changed to'
    }[data.alertType];

    const notification: NotificationPayload = {
      type: 'nft_alert',
      title: `${data.collectionName} Price Alert`,
      message: `Floor price has ${actionText} your target of ${data.targetPrice} ${data.currency}.\n\nCurrent floor price: ${data.floorPrice} ${data.currency}`,
      blockchain: data.blockchain,
      amount: data.floorPrice,
      currency: data.currency,
      timestamp: Date.now(),
      priority: Math.abs(data.floorPrice - data.targetPrice) / data.targetPrice > 0.1 ? 'high' : 'medium'
    };

    return await this.sendNotification(chatId, notification);
  }

  // Send Chain Fusion alert
  async sendChainFusionAlert(chatId: string, data: {
    operation: string;
    sourceChain: string;
    targetChain: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    txHash?: string;
  }): Promise<boolean> {
    const statusEmoji = {
      pending: '⏳',
      completed: '✅',
      failed: '❌'
    }[data.status];

    const notification: NotificationPayload = {
      type: 'chain_fusion_alert',
      title: `Chain Fusion ${data.operation}`,
      message: `${statusEmoji} ${data.operation} from ${data.sourceChain} to ${data.targetChain}\n\nStatus: ${data.status.toUpperCase()}${data.txHash ? `\nTx Hash: ${data.txHash.substring(0, 10)}...` : ''}`,
      blockchain: `${data.sourceChain} → ${data.targetChain}`,
      amount: data.amount,
      currency: data.currency,
      timestamp: Date.now(),
      priority: data.status === 'failed' ? 'high' : 'medium'
    };

    return await this.sendNotification(chatId, notification);
  }

  // Send portfolio update
  async sendPortfolioUpdate(chatId: string, data: {
    totalValue: number;
    currency: string;
    changePercent: number;
    changeAmount: number;
    topGainer?: { name: string; change: number };
    topLoser?: { name: string; change: number };
  }): Promise<boolean> {
    const isPositive = data.changePercent >= 0;
    const changeEmoji = isPositive ? '📈' : '📉';
    const changeSign = isPositive ? '+' : '';

    let message = `${changeEmoji} Portfolio value: ${data.totalValue.toLocaleString()} ${data.currency}\n\n24h Change: ${changeSign}${data.changePercent.toFixed(2)}% (${changeSign}${data.changeAmount.toLocaleString()} ${data.currency})`;

    if (data.topGainer) {
      message += `\n\n🏆 Top Gainer: ${data.topGainer.name} (+${data.topGainer.change.toFixed(2)}%)`;
    }

    if (data.topLoser) {
      message += `\n📉 Top Loser: ${data.topLoser.name} (${data.topLoser.change.toFixed(2)}%)`;
    }

    const notification: NotificationPayload = {
      type: 'portfolio_update',
      title: 'Portfolio Update',
      message,
      amount: data.totalValue,
      currency: data.currency,
      timestamp: Date.now(),
      priority: Math.abs(data.changePercent) > 10 ? 'high' : 'low'
    };

    return await this.sendNotification(chatId, notification);
  }

  // Test connection to bot
  async testConnection(): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`);
      const result = await response.json();
      
      if (result.ok) {
        return { success: true, botInfo: result.result };
      } else {
        return { success: false, error: result.description };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramNotificationService();

// React hook for using Telegram notifications
export const useTelegramNotifications = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [botInfo, setBotInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const testConnection = async () => {
      const result = await telegramService.testConnection();
      setIsConnected(result.success);
      if (result.botInfo) {
        setBotInfo(result.botInfo);
      }
    };

    testConnection();
  }, []);

  const sendTestMessage = async (chatId: string) => {
    const testNotification: NotificationPayload = {
      type: 'cycles_alert',
      title: 'Test Notification',
      message: 'This is a test message from PivotFlow! Your Telegram notifications are working correctly.',
      blockchain: 'Internet Computer',
      timestamp: Date.now(),
      priority: 'low'
    };

    return await telegramService.sendNotification(chatId, testNotification);
  };

  return {
    isConnected,
    botInfo,
    sendTestMessage,
    sendCyclesAlert: telegramService.sendCyclesAlert.bind(telegramService),
    sendNftAlert: telegramService.sendNftAlert.bind(telegramService),
    sendChainFusionAlert: telegramService.sendChainFusionAlert.bind(telegramService),
    sendPortfolioUpdate: telegramService.sendPortfolioUpdate.bind(telegramService),
  };
};

export default telegramService;

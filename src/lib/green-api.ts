import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

import { env } from './env';
import type {
  GreenApiConfig,
  GreenApiMessage,
  GreenApiFileMessage,
  GreenApiResponse,
  GreenApiWebhook,
  GreenApiContact,
  GreenApiChatInfo,
  IntegrationError,
  ApiResponse,
} from '../types/integrations';

// Configuration object
const greenApiConfig: GreenApiConfig = {
  instanceId: process.env.NEXT_PUBLIC_GREEN_API_INSTANCE_ID || '',
  accessToken: process.env.NEXT_PUBLIC_GREEN_API_ACCESS_TOKEN || '',
  baseUrl: process.env.NEXT_PUBLIC_GREEN_API_BASE_URL || '',
};

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: `${greenApiConfig.baseUrl}/waInstance${greenApiConfig.instanceId}`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Error handling utility for Green API operations
function handleGreenApiError(error: any): IntegrationError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    return {
      service: 'green-api',
      code: axiosError.response?.status?.toString() || 'NETWORK_ERROR',
      message:
        (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        'Network error occurred',
      details: axiosError.response?.data || axiosError,
    };
  }

  return {
    service: 'green-api',
    code: 'UNKNOWN_ERROR',
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
    details: error,
  };
}

// Format phone number to Green API format
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add country code if not present
  if (cleaned.startsWith('0')) {
    return `972${cleaned.substring(1)}@c.us`;
  }

  if (!cleaned.startsWith('972')) {
    return `972${cleaned}@c.us`;
  }

  return `${cleaned}@c.us`;
}

// Validate chat ID format
function validateChatId(chatId: string): boolean {
  return chatId.includes('@c.us') || chatId.includes('@g.us');
}

// Core API methods
export class GreenApiClient {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = createApiClient();
  }

  // Send text message
  async sendMessage(
    chatId: string,
    message: string,
    quotedMsgId?: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    try {
      const formattedChatId = chatId.includes('@')
        ? chatId
        : formatPhoneNumber(chatId);

      if (!validateChatId(formattedChatId)) {
        return {
          success: false,
          error: {
            service: 'green-api',
            code: 'INVALID_CHAT_ID',
            message: 'Invalid chat ID format',
          },
        };
      }

      const payload: GreenApiMessage = {
        chatId: formattedChatId,
        message,
        quotedMsgId,
      };

      const response: AxiosResponse<GreenApiResponse> =
        await this.apiClient.post(
          `/sendMessage/${greenApiConfig.accessToken}`,
          payload
        );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Send file message
  async sendFileByUrl(
    chatId: string,
    fileUrl: string,
    fileName: string,
    caption?: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    try {
      const formattedChatId = chatId.includes('@')
        ? chatId
        : formatPhoneNumber(chatId);

      if (!validateChatId(formattedChatId)) {
        return {
          success: false,
          error: {
            service: 'green-api',
            code: 'INVALID_CHAT_ID',
            message: 'Invalid chat ID format',
          },
        };
      }

      const payload: GreenApiFileMessage = {
        chatId: formattedChatId,
        urlFile: fileUrl,
        fileName,
        caption,
      };

      const response: AxiosResponse<GreenApiResponse> =
        await this.apiClient.post(
          `/sendFileByUrl/${greenApiConfig.accessToken}`,
          payload
        );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get account info
  async getAccountInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await this.apiClient.get(
        `/getSettings/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get state instance (connection status)
  async getStateInstance(): Promise<ApiResponse<{ stateInstance: string }>> {
    try {
      const response = await this.apiClient.get(
        `/getStateInstance/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get QR code for WhatsApp connection
  async getQRCode(): Promise<ApiResponse<{ type: string; message: string }>> {
    try {
      const response = await this.apiClient.get(
        `/qr/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get contacts list
  async getContacts(): Promise<ApiResponse<GreenApiContact[]>> {
    try {
      const response = await this.apiClient.get(
        `/getContacts/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get chat info
  async getChatInfo(chatId: string): Promise<ApiResponse<GreenApiChatInfo>> {
    try {
      const formattedChatId = chatId.includes('@')
        ? chatId
        : formatPhoneNumber(chatId);

      const response = await this.apiClient.post(
        `/getChatHistory/${greenApiConfig.accessToken}`,
        { chatId: formattedChatId, count: 1 }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Logout from instance
  async logout(): Promise<ApiResponse<{ isLogout: boolean }>> {
    try {
      const response = await this.apiClient.get(
        `/logout/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Reboot instance
  async reboot(): Promise<ApiResponse<{ isReboot: boolean }>> {
    try {
      const response = await this.apiClient.get(
        `/reboot/${greenApiConfig.accessToken}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }

  // Get chat history
  async getChatHistory(
    chatId: string,
    count: number = 100
  ): Promise<ApiResponse<any[]>> {
    try {
      const formattedChatId = chatId.includes('@')
        ? chatId
        : formatPhoneNumber(chatId);

      const response = await this.apiClient.post(
        `/getChatHistory/${greenApiConfig.accessToken}`,
        { chatId: formattedChatId, count }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleGreenApiError(error),
      };
    }
  }
}

// Create singleton instance
export const greenApiClient = new GreenApiClient();

// High-level utility functions
export const greenApi = {
  // Send a simple text message
  async sendTextMessage(
    phone: string,
    message: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    return greenApiClient.sendMessage(phone, message);
  },

  // Send image with Cloudinary URL
  async sendImageMessage(
    phone: string,
    imageUrl: string,
    caption?: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    const fileName = `image_${Date.now()}.jpg`;
    return greenApiClient.sendFileByUrl(phone, imageUrl, fileName, caption);
  },

  // Send notification about new report
  async sendReportNotification(
    phone: string,
    settlementName: string,
    volume: number,
    price: number,
    imageUrl?: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    const message = `
🏘️ דוח איסוף חדש - ${settlementName}

📊 כמות: ${volume} מ"ק
💰 סכום: ${price} ₪

תודה על השירות!
    `.trim();

    if (imageUrl) {
      return greenApiClient.sendFileByUrl(
        phone,
        imageUrl,
        `report_${Date.now()}.jpg`,
        message
      );
    } else {
      return greenApiClient.sendMessage(phone, message);
    }
  },

  // Send error notification
  async sendErrorNotification(
    phone: string,
    error: string
  ): Promise<ApiResponse<GreenApiResponse>> {
    const message = `
⚠️ התרחשה שגיאה במערכת

${error}

אנא צרו קשר עם התמיכה הטכנית.
    `.trim();

    return greenApiClient.sendMessage(phone, message);
  },

  // Check if instance is connected
  async isInstanceReady(): Promise<boolean> {
    const state = await greenApiClient.getStateInstance();
    return state.success && state.data?.stateInstance === 'authorized';
  },

  // Format Israeli phone number
  formatIsraeliPhone(phone: string): string {
    return formatPhoneNumber(phone);
  },

  // Validate phone number
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+972|972|0)?[2-9][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },
};

// Webhook handler utilities
export const webhookHandler = {
  // Validate webhook signature (if using webhook secret)
  validateWebhook(payload: any, signature?: string): boolean {
    if (!process.env.NEXT_PUBLIC_WEBHOOK_SECRET || !signature) return true;

    // Implement HMAC signature validation if needed
    // This is a placeholder for now
    return true;
  },

  // Parse incoming webhook
  parseWebhook(payload: any): GreenApiWebhook | null {
    try {
      if (payload.typeWebhook && payload.instanceData && payload.messageData) {
        return payload as GreenApiWebhook;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Handle incoming message webhook
  async handleIncomingMessage(webhook: GreenApiWebhook): Promise<void> {
    if (webhook.typeWebhook !== 'incomingMessageReceived') return;

    const { senderData, messageData } = webhook;

    // Log incoming message
    console.log('Incoming WhatsApp message:', {
      from: senderData.chatId,
      sender: senderData.senderName,
      type: messageData.typeMessage,
      message: messageData.textMessageData?.textMessage,
    });

    // Add your business logic here
    // For example, auto-reply, save to database, etc.
  },

  // Handle status webhook
  async handleStatusUpdate(webhook: GreenApiWebhook): Promise<void> {
    if (
      !['outgoingMessageStatus', 'outgoingAPIMessageStatus'].includes(
        webhook.typeWebhook
      )
    )
      return;

    // Handle delivery status updates
    console.log('Message status update:', webhook);

    // Add your business logic here
    // For example, update notification status in database
  },
};

// Health check utility
export async function checkGreenApiConnection(): Promise<
  ApiResponse<{ status: string; connected: boolean }>
> {
  try {
    const state = await greenApiClient.getStateInstance();

    if (!state.success) {
      return {
        success: false,
        error: state.error,
      };
    }

    const isConnected = state.data?.stateInstance === 'authorized';

    return {
      success: true,
      data: {
        status: state.data?.stateInstance || 'unknown',
        connected: isConnected,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleGreenApiError(error),
    };
  }
}

// Validate Green API configuration
export function validateGreenApiConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // If both credentials are missing, consider it valid (optional integration)
  if (!greenApiConfig.instanceId && !greenApiConfig.accessToken) {
    return {
      valid: true,
      errors: [],
    };
  }

  // If only one credential is provided, both are required
  if (!greenApiConfig.instanceId && greenApiConfig.accessToken) {
    errors.push('Instance ID is required when Access Token is provided');
  }
  if (greenApiConfig.instanceId && !greenApiConfig.accessToken) {
    errors.push('Access token is required when Instance ID is provided');
  }
  if (!greenApiConfig.baseUrl) errors.push('Base URL is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export configuration (without secrets)
export const greenApiPublicConfig = {
  instanceId: greenApiConfig.instanceId,
  baseUrl: greenApiConfig.baseUrl,
};

export default greenApiClient;

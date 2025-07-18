// Supabase Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface DatabaseConfig {
  url: string;
}

// Supabase Storage Types (replacing Cloudinary)
export interface SupabaseStorageUploadResult {
  id: string;
  path: string;
  fullPath: string;
}

export interface SupabaseStorageUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  upsert?: boolean;
}

export interface SupabaseImageUploadResult extends SupabaseStorageUploadResult {
  publicUrl: string;
  filePath: string;
}

// Green API WhatsApp Types
export interface GreenApiConfig {
  instanceId: string;
  accessToken: string;
  baseUrl: string;
}

export interface GreenApiMessage {
  chatId: string;
  message: string;
  quotedMsgId?: string;
}

export interface GreenApiFileMessage {
  chatId: string;
  urlFile: string;
  fileName: string;
  caption?: string;
}

export interface GreenApiResponse<T = any> {
  idMessage: string;
}

export interface GreenApiWebhook {
  typeWebhook: string;
  instanceData: {
    idInstance: number;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage: string;
  senderData: {
    chatId: string;
    sender: string;
    senderName: string;
  };
  messageData: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    fileMessageData?: {
      downloadUrl: string;
      caption: string;
      fileName: string;
      jpegThumbnail: string;
      mimeType: string;
    };
  };
}

export interface GreenApiContact {
  id: string;
  name: string;
  type: string;
}

export interface GreenApiChatInfo {
  chatId: string;
  type: string;
  name: string;
  ephemeralExpiration: number;
  ephemeralSettingTimestamp: number;
}

// Error Types
export interface IntegrationError {
  service: 'supabase' | 'green-api';
  code: string;
  message: string;
  details?: any;
}

// Environment Configuration Types
export interface AppConfig {
  supabase: SupabaseConfig;
  greenApi: GreenApiConfig;
  database: DatabaseConfig;
  app: {
    url: string;
    environment: 'development' | 'production' | 'test';
  };
  security: {
    nextAuthSecret: string;
    nextAuthUrl?: string;
    webhookSecret?: string;
    encryptionKey?: string;
  };
}

// Utility Types
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: IntegrationError;
    };

export type AsyncApiResponse<T> = Promise<ApiResponse<T>>;

// Upload Types
export interface FileUpload {
  file: File;
  options?: SupabaseStorageUploadOptions;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// WhatsApp Message Types
export type WhatsAppMessageType =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'documentMessage'
  | 'audioMessage'
  | 'contactMessage'
  | 'locationMessage';

export interface WhatsAppMessage {
  id: string;
  type: WhatsAppMessageType;
  chatId: string;
  sender: string;
  timestamp: number;
  content: string | GreenApiFileMessage;
  isIncoming: boolean;
}

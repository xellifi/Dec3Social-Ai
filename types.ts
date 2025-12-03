
export enum View {
  DASHBOARD = 'DASHBOARD',
  REPLIES = 'REPLIES',
  ACTIVITY = 'ACTIVITY',
  POSTER = 'POSTER',
  API_MANAGER = 'API_MANAGER',
  SETTINGS = 'SETTINGS',
  GUIDE = 'GUIDE',
  LEGAL = 'LEGAL',
}

export interface ConnectedPage {
  id: string;
  name: string;
  accessToken: string;
  isConnected: boolean;
  automationEnabled: boolean;
  followers: number;
  aiInstructions: string;
  avatarUrl: string;
  connectedInstagram?: string;
  instagramAvatarUrl?: string;
}

export interface Post {
  id: string;
  pageId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isPopular?: boolean;
}

export interface ScheduledPost {
  id: string;
  pageId: string;
  content: string;
  mediaType: 'text' | 'image' | 'video';
  mediaUrl?: string;
  scheduledTime: string; // ISO string
  status: 'queued' | 'published';
  recurrence: 'once' | '30m' | '1h' | '3h' | '6h' | '12h' | 'daily' | 'weekly';
}

export interface ApiConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'deepseek' | 'veo' | 'mistral' | 'xai' | 'cohere' | 'stability' | 'runway' | 'luma';
  apiKey: string;
  isActive: boolean;
}

export interface ReplyConfig {
  id: string;
  pageId: string;
  useAi: boolean;
  keywords: string[]; // For static
  staticResponse: string;
  type: 'comment' | 'dm';
}

export interface AppSettings {
  fbAppId: string;
  fbAppSecret: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
}
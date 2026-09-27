// Frontend shared types for the poster platform

export type OccasionType = 'victory_day' | 'election' | 'memorial' | 'greetings' | '';

export interface LeaderEntry {
  photoFile?: File;
  photoPreview?: string;   // blob URL for local preview
  name: string;
  designation: string;
}

export interface PosterFormState {
  // Occasion
  occasionType: OccasionType;
  // Content
  headline: string;
  subHeadline: string;
  dateLine: string;
  partyName: string;
  // Theme
  primaryColor: string;
  accentColor: string;
  enhanceWithGemini: boolean;
  // Promoter
  promoterName: string;
  promoterDesignation: string;
  promoterArea: string;
  promoterContact: string;
  // Leaders
  leaders: LeaderEntry[];
}

export interface GeminiColorTheme {
  name: string;
  primary: string;
  accent: string;
  description: string;
}

export interface GeminiEnhancements {
  aiGenerated: boolean;
  slogansOffered: string[];
  colorThemesOffered: GeminiColorTheme[];
  appliedTheme: GeminiColorTheme;
}

export interface PosterResult {
  posterId: string;
  status: string;
  imageUrl: string;
  renderTimeMs: number;
  dimensions: { width: number; height: number };
  uploadedPhotos: string[];
  geminiEnhancements: GeminiEnhancements | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

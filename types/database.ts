// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>;
      };
      contact_events: {
        Row: ContactEvent;
        Insert: Omit<ContactEvent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ContactEvent, 'id' | 'created_at'>>;
      };
      gift_ideas: {
        Row: GiftIdea;
        Insert: Omit<GiftIdea, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GiftIdea, 'id' | 'created_at'>>;
      };
      gift_assets: {
        Row: GiftAsset;
        Insert: Omit<GiftAsset, 'id' | 'created_at'>;
        Update: Partial<Omit<GiftAsset, 'id' | 'created_at'>>;
      };
      reminders: {
        Row: Reminder;
        Insert: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Reminder, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface Profile {
  id: string;
  user_id: string | null; // null for anonymous users
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  profile_id: string;
  name: string;
  nickname: string | null;
  notes: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  source: 'manual' | 'system';
  system_contact_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactEvent {
  id: string;
  contact_id: string;
  profile_id: string;
  title: string;
  event_date: string; // YYYY-MM-DD format
  event_type: 'birthday' | 'anniversary' | 'custom';
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

export type GiftCategory = 'practical' | 'emotional' | 'fun' | 'experience';
export type GiftContext = 'birthday' | 'christmas' | 'anniversary' | 'random' | 'custom';
export type GiftStatus = 'idea' | 'bought' | 'delivered';

export interface GiftIdea {
  id: string;
  contact_id: string;
  profile_id: string;
  title: string;
  description: string | null;
  category: GiftCategory | null;
  context: GiftContext | null;
  status: GiftStatus;
  estimated_budget: number | null;
  links: string[] | null;
  related_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GiftAsset {
  id: string;
  gift_idea_id: string;
  profile_id: string;
  asset_url: string;
  asset_type: 'image' | 'file';
  created_at: string;
}

export interface Reminder {
  id: string;
  profile_id: string;
  contact_id: string | null;
  event_id: string | null;
  gift_idea_id: string | null;
  title: string;
  message: string | null;
  remind_at: string;
  notification_id: string | null;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

// UI Types
export interface ContactWithEvents extends Contact {
  events?: ContactEvent[];
  upcomingEvent?: ContactEvent;
}

export interface GiftIdeaWithAssets extends GiftIdea {
  assets?: GiftAsset[];
}

export type ThemeMode = 'light' | 'dark' | 'system';

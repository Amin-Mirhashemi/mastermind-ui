import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on schema
export interface DbUser {
  id: string;
  telegramid: string;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  bio?: string | null;
  avatarurl?: string | null;
  language: string;
  theme: string;
  soundenabled: boolean;
  notificationsenabled: boolean;
  referralcode?: string | null;
  referredbyid?: string | null;
  createdat: string;
  updatedat: string;
}

export interface DbGame {
  id: string;
  userid: string;
  attempts: number;
  iscompleted: boolean;
  iswon: boolean;
  score?: number | null;
  timetaken?: number | null;
  code?: string | null;
  completedat: string;
}

export interface DbStreak {
  id: string;
  userid: string;
  currentstreak: number;
  beststreak: number;
  lastgamedate?: string | null;
  streakstartdate?: string | null;
  updatedat: string;
}

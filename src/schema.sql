-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  userid uuid,
  attempts integer NOT NULL,
  iscompleted boolean DEFAULT true,
  iswon boolean DEFAULT false,
  score integer,
  timetaken integer,
  code text,
  completedat timestamp with time zone DEFAULT now(),
  CONSTRAINT games_pkey PRIMARY KEY (id),
  CONSTRAINT games_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE TABLE public.streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  userid uuid UNIQUE,
  currentstreak integer DEFAULT 0,
  beststreak integer DEFAULT 0,
  lastgamedate timestamp with time zone,
  streakstartdate timestamp with time zone,
  updatedat timestamp with time zone DEFAULT now(),
  CONSTRAINT streaks_pkey PRIMARY KEY (id),
  CONSTRAINT streaks_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  telegramid text NOT NULL UNIQUE,
  username text,
  firstname text,
  lastname text,
  bio text,
  avatarurl text,
  language text DEFAULT 'en'::text,
  theme text DEFAULT 'light'::text,
  soundenabled boolean DEFAULT true,
  notificationsenabled boolean DEFAULT true,
  referralcode text DEFAULT SUBSTRING(md5((random())::text) FROM 1 FOR 8) UNIQUE,
  referredbyid uuid,
  createdat timestamp with time zone DEFAULT now(),
  updatedat timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_referredbyid_fkey FOREIGN KEY (referredbyid) REFERENCES public.users(id)
);
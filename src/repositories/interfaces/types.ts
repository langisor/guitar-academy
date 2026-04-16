export interface Level {
  id: number;
  world_id: number;
  title: string;
  description: string | null;
  content_path: string | null;
  difficulty: string;
  xp_reward: number;
  order_index: number;
  is_locked: number;
}

export interface Exercise {
  id: number;
  level_id: number;
  type: string;
  question: string;
  options: string | null;
  correct_answer: string | null;
  data: string | null;
  xp_reward: number;
  order_index: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  chords: string | string[];
  difficulty: string;
  tempo: number;
  capo: number;
  tuning: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  xp: number;
  streak: number;
  last_practice_date: string | null;
  daily_goal: number;
  created_at: string;
}

export interface World {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  is_locked: number;
}

export interface UserProgress {
  id: number;
  user_id: number;
  level_id: number;
  completed: number;
  stars: number;
  xp_earned: number;
  attempts: number;
  completed_at: string | null;
}

export interface DailyGoal {
  id: number;
  user_id: number;
  date: string;
  minutes_practiced: number;
  goal_minutes: number;
  completed: number;
}

export interface PracticeSession {
  id: number;
  user_id: number;
  duration_minutes: number;
  exercises_completed: number;
  xp_earned: number;
  date: string;
}

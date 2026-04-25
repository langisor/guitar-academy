export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_practice_date TEXT,
  daily_goal INTEGER DEFAULT 15,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'music',
  order_index INTEGER NOT NULL,
  is_locked INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_path TEXT,
  difficulty TEXT DEFAULT 'easy',
  xp_reward INTEGER DEFAULT 50,
  order_index INTEGER NOT NULL,
  is_locked INTEGER DEFAULT 1,
  FOREIGN KEY (world_id) REFERENCES worlds(id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT,
  correct_answer TEXT,
  data TEXT,
  xp_reward INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  chords TEXT NOT NULL,
  difficulty TEXT DEFAULT 'easy',
  tempo INTEGER DEFAULT 80,
  capo INTEGER DEFAULT 0,
  tuning TEXT DEFAULT 'standard'
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  level_id INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (level_id) REFERENCES levels(id),
  UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  exercises_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  date TEXT DEFAULT CURRENT_DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS daily_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  minutes_practiced INTEGER DEFAULT 0,
  goal_minutes INTEGER DEFAULT 15,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);
`;

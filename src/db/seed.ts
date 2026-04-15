import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "guitar-academy.db");
const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const schema = `
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

db.exec(schema);

const worldsData = [
  { title: "Beginner Basics", titleAr: "أساسيات المبتدئين", description: "Learn guitar strings and basic techniques", icon: "music" },
  { title: "Open Chords", titleAr: "الأكوردات المفتوحة", description: "Master essential open chords", icon: "git-fork" },
  { title: "Chord Transitions", titleAr: "الانتقال بين الأكوردات", description: "Smooth transitions between chords", icon: "repeat" },
  { title: "Strumming Patterns", titleAr: "أنماط العزف", description: "Learn essential strumming patterns", icon: "waves" },
  { title: "First Songs", titleAr: "الأغاني الأولى", description: "Play your favorite songs", icon: "music-2" },
  { title: "Barre Chords", titleAr: "أكوردات القضيب", description: "Master barre chord techniques", icon: "grip" },
  { title: "Fretboard Mastery", titleAr: "إتقان لوحة العزف", description: "Navigate the fretboard with confidence", icon: "layout-grid" },
  { title: "Rock Riffs", titleAr: " Rifffs الروك", description: "Learn iconic rock riffs", icon: "flame" },
  { title: "Advanced Techniques", titleAr: "التقنيات المتقدمة", description: "Take your playing to the next level", icon: "zap" },
  { title: "Master Guitarist", titleAr: "عازف الجيتار المحترف", description: "Become a master guitarist", icon: "crown" },
];

const levelsData = [
  ["Guitar Parts", "Holding the Guitar", "Tuning Basics", "String Names", "Quiz Time"],
  ["G Major", "C Major", "D Major", "E Minor", "Quiz Time"],
  ["G to C", "C to D", "D to Em", "Em to Am", "Quiz Time"],
  ["Down Strum", "Down-Up Pattern", "Country Pattern", "Pop Pattern", "Quiz Time"],
  ["Let It Be Intro", "Horse With No Name", "Wonderwall", "Knockin Heaven's Door", "Song Challenge"],
  ["F Major Barre", "Bm Barre", "Dm Barre", "Fm Barre", "Quiz Time"],
  ["Note Names", "Scale Patterns", "Interval Shapes", "Triads", "Quiz Time"],
  ["Smoke on Water", "Seven Nation Army", "Iron Man", "Back in Black", "Riff Challenge"],
  ["Fingerpicking", "Hammer-ons", "Pull-offs", "Slides", "Quiz Time"],
  ["Advanced Rhythm", "Jazz Chords", "Modal Interchange", "Live Performance", "Final Challenge"],
];

const songsData = [
  { title: "Knockin' on Heaven's Door", artist: "Bob Dylan", chords: "G,D,Am,C", difficulty: "easy", tempo: 70 },
  { title: "Wonderwall", artist: "Oasis", chords: "Em,G,D,A", difficulty: "easy", tempo: 85, capo: 2 },
  { title: "Horse With No Name", artist: "America", chords: "Em,D6/9", difficulty: "easy", tempo: 75 },
  { title: "Let Her Go", artist: "Passenger", chords: "Am,G,C,F", difficulty: "medium", tempo: 90 },
  { title: "Hotel California", artist: "Eagles", chords: "Bm,F#,A,E,G,D,Em,F#m", difficulty: "hard", tempo: 80 },
  { title: "Let It Be", artist: "The Beatles", chords: "C,G,Am,F", difficulty: "easy", tempo: 75 },
  { title: "Wish You Were Here", artist: "Pink Floyd", chords: "Am,G,C,F", difficulty: "medium", tempo: 60, capo: 1 },
  { title: "Take Me Home", artist: "John Denver", chords: "G,Em,C,D", difficulty: "easy", tempo: 65 },
];

console.log("Seeding database...");

db.exec(`
  INSERT OR REPLACE INTO users (id, username, email, password_hash, xp, streak) VALUES (1, 'demo', 'demo@example.com', 'demo', 0, 0);
`);

worldsData.forEach((world, index) => {
  db.prepare(
    "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(1, world.title, world.description, world.icon, index + 1, index === 0 ? 0 : 1);
  
  db.prepare(
    "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(2, world.titleAr, world.description, world.icon, index + 1, index === 0 ? 0 : 1);
});

let levelId = 1;
worldsData.forEach((world, worldIndex) => {
  levelsData[worldIndex].forEach((levelTitle, levelIndex) => {
    db.prepare(`
      INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      worldIndex + 1,
      levelTitle,
      `Learn ${levelTitle.toLowerCase()}`,
      worldIndex < 2 ? "easy" : worldIndex < 5 ? "medium" : "hard",
      50,
      levelIndex + 1,
      levelIndex === 0 && worldIndex === 0 ? 0 : 1,
      `guitar/world-${worldIndex + 1}/level-${String(levelIndex + 1).padStart(3, '0')}.mdx`
    );
    levelId++;
  });
});

songsData.forEach((song) => {
  db.prepare(`
    INSERT INTO songs (title, artist, chords, difficulty, tempo, capo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(song.title, song.artist, song.chords, song.difficulty, song.tempo, song.capo || 0);
});

console.log("Database seeded successfully!");
console.log(`- 2 courses`);
console.log(`- 20 worlds`);
console.log(`- 100 levels`);
console.log(`- ${songsData.length} songs`);

db.close();

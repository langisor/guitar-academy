import Database from "better-sqlite3";
import { schema } from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "guitar-academy.db");

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
 if (!db) {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(schema);

  seedDatabaseIfEmpty(db);
 }
 return db;
}

function seedDatabaseIfEmpty(database: Database.Database) {
 const courseCount = database.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };

 if (courseCount.count === 0) {
  seedDatabase(database);
 }
}

function seedDatabase(database: Database.Database) {
 database.exec(`
    INSERT INTO users (username, email, password_hash, xp, streak) VALUES 
    ('demo', 'demo@example.com', 'demo', 0, 0);
    
    INSERT INTO courses (title, language, description) VALUES 
    ('Guitar Fundamentals', 'en', 'Learn guitar from scratch with interactive lessons'),
    ('أساسيات الجيتار', 'ar', 'تعلم الجيتار من الصفر مع دروس تفاعلية');
  `);

  const worlds = [
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

  const insertWorld = database.prepare(
    "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const lessonTopics = [
    ["Guitar Parts", "Holding the Guitar", "Tuning Basics", "String Names", "Fret Basics"],
    ["G Major", "C Major", "D Major", "E Minor", "A Minor"],
    ["G to C", "C to D", "D to Em", "Em to Am", "Am to E"],
    ["Down Strum", "Down-Up Pattern", "Country Pattern", "Pop Pattern", "Rock Pattern"],
    ["Let It Be Intro", "Horse With No Name", "Wonderwall", "Knockin Heaven's Door", "Let Her Go"],
    ["F Major Barre", "Bm Barre", "Dm Barre", "Fm Barre", "Cm Barre"],
    ["Note Names", "Scale Patterns", "Interval Shapes", "Triads", "Position Playing"],
    ["Smoke on Water", "Seven Nation Army", "Iron Man", "Back in Black", "Sunshine of Your Love"],
    ["Fingerpicking", "Hammer-ons", "Pull-offs", "Slides", "Bends"],
    ["Advanced Rhythm", "Jazz Chords", "Modal Interchange", "Live Performance", "Music Theory"],
  ];

  const insertLevel = database.prepare(
    "INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  worlds.forEach((world, index) => {
    // Insert English World
    const enResult = insertWorld.run(1, world.title, world.description, world.icon, index + 1, index === 0 ? 0 : 1);
    const enWorldId = enResult.lastInsertRowid;

    // Insert Arabic World
    const arResult = insertWorld.run(2, world.titleAr, world.description, world.icon, index + 1, index === 0 ? 0 : 1);
    const arWorldId = arResult.lastInsertRowid;

    // Seed levels for this world's topics
    const topics = lessonTopics[index];
    topics.forEach((topic, levelIndex) => {
      // English Level
      insertLevel.run(
        enWorldId,
        topic,
        `Learn ${topic.toLowerCase()}`,
        index < 2 ? "easy" : index < 5 ? "medium" : "hard",
        50,
        levelIndex + 1,
        levelIndex === 0 ? 0 : 1,
        `guitar/world-${index + 1}/level-${String(levelIndex + 1).padStart(3, '0')}.mdx`
      );

      // Arabic Level
      insertLevel.run(
        arWorldId,
        topic, // You can substitute with translations here if available
        `تعلم ${topic}`,
        index < 2 ? "easy" : index < 5 ? "medium" : "hard",
        50,
        levelIndex + 1,
        levelIndex === 0 ? 0 : 1,
        `guitar/world-${index + 1}/level-${String(levelIndex + 1).padStart(3, '0')}.mdx`
      );
    });
  });

 database.exec(`
    INSERT INTO songs (title, artist, chords, difficulty, tempo, capo) VALUES
    ('Knockin on Heavens Door', 'Bob Dylan', 'G,D,Am,C', 'easy', 70, 0),
    ('Wonderwall', 'Oasis', 'Em,G,D,A', 'easy', 85, 2),
    ('Horse With No Name', 'America', 'Em,D6/9', 'easy', 75, 0),
    ('Let Her Go', 'Passenger', 'Am,G,C,F', 'medium', 90, 0),
    ('Hotel California', 'Eagles', 'Bm,F#,A,E,G,D,Em,F#m', 'hard', 80, 0),
    ('Take Me Home', 'John Denver', 'G,Em,C,D', 'easy', 65, 0),
    ('Let It Be', 'The Beatles', 'C,G,Am,F', 'easy', 75, 0),
    ('Wish You Were Here', 'Pink Floyd', 'Am,G,C,F', 'medium', 60, 1);
  `);
}

export function closeDatabase() {
 if (db) {
  db.close();
  db = null;
 }
}

import { createClient, type Client } from "@libsql/client";
import { schema } from "./schema";
import path from "path";
import fs from "fs";

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "data", "guitar-academy.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Create the client
export const db: Client = createClient({
  url,
  authToken,
});

/**
 * Ensures the database is initialized with the schema and initial data.
 * This is designed to be called during application startup or in a build script.
 */
export async function getDatabase(): Promise<Client> {
  // For local files, ensure the directory exists
  if (url.startsWith("file:")) {
    const dbPath = url.replace("file:", "");
    const dbDir = path.dirname(dbPath);
    if (dbDir && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  // Check if we need to initialize the schema
  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='courses'");
    if (result.rows.length === 0) {
      console.log("Initializing database schema...");
      await db.executeMultiple(schema);
      await seedDatabase(db);
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    // Fallback: try to apply schema anyway if the check fails
    await db.executeMultiple(schema);
  }

  return db;
}

async function seedDatabase(client: Client) {
  console.log("Seeding database initial content...");
  
  await client.execute(`
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

  for (let i = 0; i < worlds.length; i++) {
    const world = worlds[i];
    
    // Insert English World
    const enWorld = await client.execute({
      sql: "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: [1, world.title, world.description, world.icon, i + 1, i === 0 ? 0 : 1]
    });
    const enWorldId = enWorld.rows[0].id as number;

    // Insert Arabic World
    const arWorld = await client.execute({
      sql: "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: [2, world.titleAr, world.description, world.icon, i + 1, i === 0 ? 0 : 1]
    });
    const arWorldId = arWorld.rows[0].id as number;

    const topics = lessonTopics[i];
    for (let j = 0; j < topics.length; j++) {
      const topic = topics[j];
      const difficulty = i < 2 ? "easy" : i < 5 ? "medium" : "hard";
      const contentPath = `guitar/world-${i + 1}/level-${String(j + 1).padStart(3, "0")}.mdx`;

      await client.execute({
        sql: "INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [enWorldId, topic, `Learn ${topic.toLowerCase()}`, difficulty, 50, j + 1, j === 0 ? 0 : 1, contentPath]
      });

      await client.execute({
        sql: "INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [arWorldId, topic, `تعلم ${topic}`, difficulty, 50, j + 1, j === 0 ? 0 : 1, contentPath]
      });
    }
  }

  await client.execute(`
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
  // Client is managed by libsql, closing is usually not required for typical app usage
  // but we can provide a cleanup if needed.
}

import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";
import { schema } from "./schema";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "data", "guitar-academy.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function seed() {
  console.log(`Connecting to database at: ${url}`);
  
  if (url.startsWith("file:")) {
    const dbPath = url.replace("file:", "");
    const dbDir = path.dirname(dbPath);
    if (dbDir && !fs.existsSync(dbDir)) {
      console.log(`Creating directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const db = createClient({
    url,
    authToken,
  });

  console.log("Applying schema...");
  await db.executeMultiple(schema);

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

  await db.executeMultiple(`
    INSERT OR REPLACE INTO users (id, username, email, password_hash, xp, streak) VALUES (1, 'demo', 'demo@example.com', 'demo', 0, 0);
    
    INSERT OR IGNORE INTO courses (id, title, language, description) VALUES 
    (1, 'Guitar Fundamentals', 'en', 'Learn guitar from scratch with interactive lessons');
    INSERT OR IGNORE INTO courses (id, title, language, description) VALUES 
    (2, 'أساسيات الجيتار', 'ar', 'تعلم الجيتار من الصفر مع دروس تفاعلية');
  `);

  for (let i = 0; i < worldsData.length; i++) {
    const world = worldsData[i];
    
    const enWorld = await db.execute({
      sql: "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: [1, world.title, world.description, world.icon, i + 1, i === 0 ? 0 : 1]
    });
    const enWorldId = enWorld.rows[0].id as number;

    const arWorld = await db.execute({
      sql: "INSERT INTO worlds (course_id, title, description, icon, order_index, is_locked) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      args: [2, world.titleAr, world.description, world.icon, i + 1, i === 0 ? 0 : 1]
    });
    const arWorldId = arWorld.rows[0].id as number;

    const levelTitles = levelsData[i];
    for (let j = 0; j < levelTitles.length; j++) {
      const levelTitle = levelTitles[j];
      const difficulty = i < 2 ? "easy" : i < 5 ? "medium" : "hard";
      const levelNumber = i * 5 + j + 1;
      const contentPath = `guitar/world-${i + 1}/level-${String(levelNumber).padStart(3, '0')}.mdx`;

      await db.execute({
        sql: `INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [enWorldId, levelTitle, `Learn ${levelTitle.toLowerCase()}`, difficulty, 50, j + 1, j === 0 && i === 0 ? 0 : 1, contentPath]
      });

      await db.execute({
        sql: `INSERT INTO levels (world_id, title, description, difficulty, xp_reward, order_index, is_locked, content_path)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [arWorldId, levelTitle, `تعلم ${levelTitle}`, difficulty, 50, j + 1, j === 0 && i === 0 ? 0 : 1, contentPath]
      });
    }
  }

  for (const song of songsData) {
    await db.execute({
      sql: "INSERT INTO songs (title, artist, chords, difficulty, tempo, capo) VALUES (?, ?, ?, ?, ?, ?)",
      args: [song.title, song.artist, song.chords, song.difficulty, song.tempo, song.capo || 0]
    });
  }

  // Seed quizzes from generated JSON
  const quizzesPath = path.join(process.cwd(), "src", "data", "quizzes.json");
  if (fs.existsSync(quizzesPath)) {
    console.log("Seeding quizzes...");
    const quizzes = JSON.parse(fs.readFileSync(quizzesPath, "utf-8"));
    for (const quiz of quizzes) {
      await db.execute({
        sql: "INSERT INTO quizzes (level_id, question, options, correct_answer, xp_reward) VALUES (?, ?, ?, ?, ?)",
        args: [quiz.level_id, quiz.question, quiz.options, quiz.correct_answer, quiz.xp_reward]
      });
    }
  }

  // Seed exercises from generated JSON
  const exercisesPath = path.join(process.cwd(), "src", "data", "exercises.json");
  if (fs.existsSync(exercisesPath)) {
    console.log("Seeding exercises...");
    const exercises = JSON.parse(fs.readFileSync(exercisesPath, "utf-8"));
    for (const exercise of exercises) {
      await db.execute({
        sql: "INSERT INTO exercises (level_id, type, question, options, correct_answer, data, xp_reward, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [exercise.level_id, exercise.type, exercise.question, exercise.options, exercise.correct_answer, exercise.data, exercise.xp_reward, exercise.order_index]
      });
    }
  }

  console.log("Database seeded successfully!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

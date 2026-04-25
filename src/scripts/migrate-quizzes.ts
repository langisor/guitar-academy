import fs from 'fs';
import path from 'path';
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guitar');
const DATA_DIR = path.join(process.cwd(), 'src/data');
const QUIZZES_JSON_PATH = path.join(DATA_DIR, 'quizzes.json');
const EXERCISES_JSON_PATH = path.join(DATA_DIR, 'exercises.json');

const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "data", "guitar-academy.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function run() {
  const db = createClient({ url: dbUrl, authToken });
  
  // Fetch all levels
  const levelsResult = await db.execute("SELECT id, content_path FROM levels");
  const levels = levelsResult.rows;

  const quizzes: any[] = [];
  const exercises: any[] = [];
  
  // We overwrite the JSON files because we want to extract everything fresh
  
  // Recursively find all MDX files
  function findMdxFiles(dir: string): string[] {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findMdxFiles(fullPath));
      } else if (entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const mdxFiles = findMdxFiles(CONTENT_DIR);
  console.log(`Found ${mdxFiles.length} MDX files to process...`);

  for (const filePath of mdxFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Match by content_path
    // content_path in DB looks like: "guitar/world-1/level-001.mdx"
    // find index of "guitar/world-" in filePath
    const guitarPathIndex = filePath.indexOf('guitar/world-');
    if (guitarPathIndex === -1) continue;
    
    const relativePath = filePath.substring(guitarPathIndex);
    const levelRow = levels.find(l => l.content_path === relativePath);
    const levelId = levelRow ? levelRow.id : null;
    
    if (!levelId) {
      // Some MDX files (like 006a) don't have matching DB levels
      // That's okay, we can just skip them.
      continue;
    }

    let xpReward = 10;
    const xpMatch = content.match(/xp_reward:\s*(\d+)/);
    if (xpMatch) {
      xpReward = parseInt(xpMatch[1], 10);
    }

    const exerciseIndex = content.indexOf('## Exercise');
    const quizIndex = content.indexOf('## Quiz');
    
    let modified = false;

    // Extract Exercise
    if (exerciseIndex !== -1) {
      let exerciseContent = '';
      if (quizIndex !== -1 && quizIndex > exerciseIndex) {
        exerciseContent = content.substring(exerciseIndex + '## Exercise'.length, quizIndex).trim();
      } else {
        exerciseContent = content.substring(exerciseIndex + '## Exercise'.length).trim();
      }
      
      const existingEx = exercises.find(e => e.level_id === levelId && e.question === exerciseContent);
      if (!existingEx) {
        exercises.push({
          level_id: levelId as number,
          type: 'practice',
          question: exerciseContent,
          options: null,
          correct_answer: null,
          data: null,
          xp_reward: xpReward,
          order_index: 1
        });
      }
      modified = true;
    }

    // Extract Quiz
    const questionMatch = content.match(/\*\*Question:\*\*\s*(.+)/);
    const optionsMatch = content.match(/- \[ \]\s*(.+)/g);
    const correctAnswerMatch = content.match(/✓ Correct Answer:\s*\*\*(.+)\*\*/);

    if (questionMatch && optionsMatch && correctAnswerMatch) {
      const question = questionMatch[1].trim();
      const options = optionsMatch.map(o => o.replace('- [ ] ', '').trim());
      const correctAnswer = correctAnswerMatch[1].trim();
      
      const existingQuiz = quizzes.find(q => q.level_id === levelId && q.question === question);
      if (!existingQuiz) {
        quizzes.push({
          level_id: levelId as number,
          question,
          options: JSON.stringify(options),
          correct_answer: correctAnswer,
          xp_reward: xpReward
        });
      }
      modified = true;
    }

    // Clean up the MDX file
    if (modified) {
      let cleanedContent = content;
      
      // Truncate from ## Exercise or ## Quiz or **Question:**
      let splitIndex = content.length;
      if (exerciseIndex !== -1) splitIndex = Math.min(splitIndex, exerciseIndex);
      if (quizIndex !== -1) splitIndex = Math.min(splitIndex, quizIndex);
      
      const qIndex = content.indexOf('**Question:**');
      if (qIndex !== -1) splitIndex = Math.min(splitIndex, qIndex);

      if (splitIndex < content.length) {
        cleanedContent = cleanedContent.substring(0, splitIndex).trim() + '\n';
        fs.writeFileSync(filePath, cleanedContent, 'utf-8');
        console.log(`Extracted and cleaned file: ${relativePath}`);
      }
    }
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Write quizzes and exercises to JSON
  fs.writeFileSync(QUIZZES_JSON_PATH, JSON.stringify(quizzes, null, 2), 'utf-8');
  fs.writeFileSync(EXERCISES_JSON_PATH, JSON.stringify(exercises, null, 2), 'utf-8');
  console.log(`Successfully saved ${quizzes.length} quizzes and ${exercises.length} exercises.`);
}

run().catch(console.error);

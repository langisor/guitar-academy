import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/guitar');
const DATA_DIR = path.join(process.cwd(), 'src/data');
const QUIZZES_JSON_PATH = path.join(DATA_DIR, 'quizzes.json');

// We will map content_path to level_id
// Because the DB levels table content_path looks like 'guitar/world-1/level-005.mdx'
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "data", "guitar-academy.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function run() {
  const db = createClient({ url: dbUrl, authToken });
  
  // Fetch all levels
  const levelsResult = await db.execute("SELECT id, title FROM levels");
  const levels = levelsResult.rows;

  const quizzes = [];
  
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
    
    // Parse title from frontmatter
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    if (!titleMatch) continue;
    const title = titleMatch[1];
    
    const levelRow = levels.find(l => l.title === title);
    const levelId = levelRow ? levelRow.id : null;
    
    if (!levelId) {
      console.warn(`No level found for title: ${title}`);
      continue;
    }

    // Try to parse quiz data
    const questionMatch = content.match(/\*\*Question:\*\*\s*(.+)/);
    const optionsMatch = content.match(/- \[ \]\s*(.+)/g);
    const correctAnswerMatch = content.match(/✓ Correct Answer:\s*\*\*(.+)\*\*/);
    
    // Some levels have xp_reward in frontmatter
    let xpReward = 10;
    const xpMatch = content.match(/xp_reward:\s*(\d+)/);
    if (xpMatch) {
      xpReward = parseInt(xpMatch[1], 10);
    }

    if (questionMatch && optionsMatch && correctAnswerMatch) {
      const question = questionMatch[1].trim();
      const options = optionsMatch.map(o => o.replace('- [ ] ', '').trim());
      const correctAnswer = correctAnswerMatch[1].trim();
      
      quizzes.push({
        level_id: levelId as number,
        question,
        options: JSON.stringify(options),
        correct_answer: correctAnswer,
        xp_reward: xpReward
      });
      
      // Clean up the MDX file
      // Look for '## Quiz' or '## Exercise' and truncate
      // Let's use '## Quiz' as the split point if it exists
      let cleanedContent = content;
      const quizIndex = cleanedContent.indexOf('## Quiz');
      if (quizIndex !== -1) {
        cleanedContent = cleanedContent.substring(0, quizIndex).trim() + '\n';
      } else {
        // Fallback: truncate from **Question:** onwards
        const qIndex = cleanedContent.indexOf('**Question:**');
        if (qIndex !== -1) {
          cleanedContent = cleanedContent.substring(0, qIndex).trim() + '\n';
        }
      }
      
      fs.writeFileSync(filePath, cleanedContent, 'utf-8');
      console.log(`Extracted quiz from ${path.basename(filePath)} and cleaned file.`);
    }
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Write quizzes to JSON
  fs.writeFileSync(QUIZZES_JSON_PATH, JSON.stringify(quizzes, null, 2), 'utf-8');
  console.log(`Successfully extracted ${quizzes.length} quizzes to ${QUIZZES_JSON_PATH}`);
}

run().catch(console.error);

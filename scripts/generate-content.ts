#!/usr/bin/env npx ts-node

import fs from "fs";
import path from "path";

const LEVELS = [
  { id: 1, world: 1, title: "Parts of the Guitar", type: "chord", lesson: "Learn the essential parts of your guitar: the headstock, tuning pegs, nut, frets, soundhole, and bridge. Each part plays a crucial role in producing sound.", exercise: "Point to each part of your guitar as you identify it.", tips: "Take your time to memorize each part before moving on." },
  { id: 2, world: 1, title: "Proper Posture", type: "chord", lesson: "Sit with good posture and hold the guitar close to your body. Rest it on your right leg (or left if you're left-handed). Keep your back straight and shoulders relaxed.", exercise: "Practice sitting in the correct position for 2 minutes.", tips: "A uncomfortable position will make playing difficult." },
  { id: 3, world: 1, title: "Tuning Basics", type: "fretboard", lesson: "Standard tuning is E-A-D-G-B-e. We use tuners to measure 'pitch.' If a note is too high, it's 'sharp'; too low is 'flat.'", question: "What is the correct tuning for the 4th string?", options: ["E", "A", "D", "G"], correctAnswer: "D", exercise: "Tune each string using a tuner.", tips: "Aim for the green light on your tuner." },
  { id: 4, world: 1, title: "String Names & Numbers", type: "quiz", lesson: "Strings are numbered 1 (high e) to 6 (low E). Remember: Eddie Ate Dynamite, Good Bye Eddie.", question: "Which string is the thinnest?", options: ["E", "A", "B", "e"], correctAnswer: "e", exercise: "Say the string names in order while pointing.", tips: "The acronym helps remember low to high." },
  { id: 5, world: 1, title: "Beginner Basics Boss", type: "quiz", lesson: "Review of posture, parts, and strings.", question: "Which part holds the strings at the bottom?", options: ["Headstock", "Nut", "Bridge", "Fretboard"], correctAnswer: "Bridge", exercise: "Complete the quiz to earn your badge.", tips: "You've learned the fundamentals!" },
  { id: 6, world: 2, title: "G Major", type: "chord", chord: "G", lesson: "The G chord uses 3 fingers: index on low E (3rd fret), middle on A (2nd fret), ring on D (3rd fret). The two high strings are open.", exercise: "Practice the G chord for 1 minute.", tips: "Keep your fingers curved." },
  { id: 7, world: 2, title: "C Major", type: "chord", chord: "C", lesson: "C is a 'stretchy' chord. Keep your thumb behind the neck for leverage. Avoid muting the open G string.", exercise: "Practice the C chord for 1 minute.", tips: "The stretch between index and middle finger is the challenge." },
  { id: 8, world: 2, title: "D Major", type: "chord", chord: "D", lesson: "The 'Triangle.' Only strum the top 4 strings.", exercise: "Practice the D chord for 1 minute.", tips: "Keep your wrist loose." },
  { id: 9, world: 2, title: "E Minor", type: "chord", chord: "Em", lesson: "The easiest chord. Just two fingers on the 2nd fret.", exercise: "Practice the Em chord for 1 minute.", tips: "Two fingers is all you need!" },
  { id: 10, world: 2, title: "Open Chords Quiz", type: "quiz", lesson: "Identify shapes and finger placements for G, C, D, and Em.", question: "Which chord has fingers on frets 2-2 on strings A and D?", options: ["Em", "G", "C", "D"], correctAnswer: "Em", exercise: "Complete the quiz.", tips: "You've got this!" },
  { id: 11, world: 3, title: "G → C", type: "transition", chord: "G", lesson: "Use the middle finger as a 'pivot' guide. Keep your fingers in their shapes and move them together.", targetBpm: 60, chords: ["G", "C"], exercise: "Transition between G and C 10 times.", tips: "Use the middle finger as your anchor." },
  { id: 12, world: 3, title: "C → D", type: "transition", chord: "C", lesson: "Focus on the ring finger sliding/positioning. Notice how similar the finger positions are.", targetBpm: 60, chords: ["C", "D"], exercise: "Transition between C and D 10 times.", tips: "The ring finger does most of the work." },
  { id: 13, world: 3, title: "D → Em", type: "transition", chord: "D", lesson: "Remove your middle and ring fingers from D to form Em.", targetBpm: 70, chords: ["D", "Em"], exercise: "Transition between D and Em 10 times.", tips: "Keep index finger down." },
  { id: 14, world: 3, title: "Em → Am", type: "transition", chord: "Em", lesson: "Am is just Em moved down one string set with an added index finger.", targetBpm: 70, chords: ["Em", "Am"], exercise: "Transition between Em and Am 10 times.", tips: "Add the pinky for Am." },
  { id: 15, world: 3, title: "Transition Quiz", type: "quiz", lesson: "Test your chord transition skills!", question: "Which transition uses the least movement?", options: ["G to C", "D to Em", "Am to E", "F to Bm"], correctAnswer: "D to Em", exercise: "Complete the quiz.", tips: "Smooth moves!" },
  { id: 16, world: 4, title: "Down Strum", type: "strumming", pattern: "DDDD", tempo: 80, lesson: "Consistent 1/4 note downbeats. Practice keeping a steady rhythm.", exercise: "Practice the down strum pattern at 80 BPM.", tips: "Keep your wrist relaxed." },
  { id: 17, world: 4, title: "Down-Up Pattern", type: "strumming", pattern: "DUDU", tempo: 90, lesson: "1/8 note subdivisions. Alternate between down and up strums.", exercise: "Practice the down-up pattern at 90 BPM.", tips: "Lead with your elbow." },
  { id: 18, world: 4, title: "Country/Folk Pattern", type: "strumming", pattern: "DDUDUD", tempo: 100, lesson: "The 'Boom-Chicka' rhythm. D-D-U-D-U-D", exercise: "Practice the country pattern at 100 BPM.", tips: "The boom comes on the downbeat." },
  { id: 19, world: 4, title: "Pop Pattern", type: "strumming", pattern: "DUDUDU", tempo: 110, lesson: "Constant motion with accents. Down on 1, up on 2-and, down on 3-and, up on 4.", exercise: "Practice the pop pattern at 110 BPM.", tips: "Never stop moving." },
  { id: 20, world: 4, title: "Strumming Quiz", type: "quiz", lesson: "Test your strumming knowledge!", question: "What does 'D' typically represent in strumming patterns?", options: ["Down strum", "Down-up strum", "Double strum", "Dampened strum"], correctAnswer: "Down strum", exercise: "Complete the quiz.", tips: "You've got rhythm!" },
  { id: 21, world: 5, title: "Let It Be", type: "song", chord: "C", progression: "C - G - Am - Em", recommendedStrumming: "D-D-U-D-U-D", lesson: "The Beatles song with C, G, Am, F (simplified to Em). A classic for beginners.", exercise: "Play through the progression smoothly.", tips: "Keep a steady beat." },
  { id: 22, world: 5, title: "A Horse with No Name", type: "song", chord: "Em", progression: "Em - D", recommendedStrumming: "D-U-D-U-D-U", lesson: "America's hit. The ultimate 2-chord song using Em and D.", exercise: "Play through the progression smoothly.", tips: "Simple but effective." },
  { id: 23, world: 5, title: "Wonderwall", type: "song", chord: "Em", progression: "Em - G - D - Am", recommendedStrumming: "D-D-U-D-U-D", lesson: "Oasis classic with Em, G, D, Am progression.", exercise: "Play through the progression smoothly.", tips: "Every strum counts." },
  { id: 24, world: 5, title: "Knockin' on Heaven's Door", type: "song", chord: "G", progression: "G - D - Am", recommendedStrumming: "D-D-U-D-U-D", lesson: "Bob Dylan's epic. G, D, Am / G, D, C.", exercise: "Play through the progression smoothly.", tips: "Simple power." },
  { id: 25, world: 5, title: "Song Challenge Boss", type: "quiz", lesson: "Match progressions to the correct song.", question: "Which song uses Em - D progression?", options: ["Let It Be", "A Horse with No Name", "Wonderwall", "Knockin' on Heaven's Door"], correctAnswer: "A Horse with No Name", exercise: "Complete the quiz.", tips: "You're playing real songs!" },
  { id: 26, world: 6, title: "F Major Barre", type: "barre", chord: "F", lesson: "Using the index finger as a 'nut.' The index bars all 6 strings while other fingers form the shape.", exercise: "Practice the F barre chord.", tips: "Squeeze hard with your index." },
  { id: 27, world: 6, title: "B Minor Barre", type: "barre", chord: "Bm", lesson: "Playing minor chords from the 5th string root. The A-shape moved up.", exercise: "Practice the Bm barre chord.", tips: "Root on the 5th string." },
  { id: 28, world: 6, title: "D Minor Barre", type: "barre", chord: "Dm", lesson: "The D-shape moved up the neck. Challenging but essential.", exercise: "Practice the Dm barre chord.", tips: "Finger strength matters." },
  { id: 29, world: 6, title: "Moving the Shapes", type: "barre", chord: "G", targetBpm: 80, lesson: "Moving F shape to fret 3 (G) and fret 5 (A). Learn to transpose barre chords.", exercise: "Practice moving the F shape up the neck.", tips: "Slide smoothly." },
  { id: 30, world: 6, title: "Barre Chord Quiz", type: "quiz", lesson: "Test your barre chord knowledge!", question: "What fret is the A-shape barre chord at root A?", options: ["3rd fret", "5th fret", "7th fret", "12th fret"], correctAnswer: "5th fret", exercise: "Complete the quiz.", tips: "You've broken through the wall!" },
  { id: 31, world: 7, title: "Note Names", type: "fretboard", lesson: "The chromatic scale and natural half-steps (B-C, E-F). All 12 notes.", exercise: "Name each note on the fretboard.", tips: "B-C and E-F have no sharps." },
  { id: 32, world: 7, title: "Minor Pentatonic Pattern 1", type: "riff", chord: "A", pattern: "X-0-2-2-0-0", lesson: "The 'Box' shape for soloing. The foundation of rock and blues soloing.", exercise: "Practice the pentatonic box shape.", tips: "Start slow." },
  { id: 33, world: 7, title: "Interval Shapes", type: "fretboard", pattern: "X-X-0-2-3-2", lesson: "Octaves and Power Chords (Roots and 5ths). Essential for rhythm guitar.", exercise: "Practice octave shapes.", tips: "Skip the middle string." },
  { id: 34, world: 7, title: "Triads", type: "fretboard", lesson: "Small 3-string shapes on strings 1, 2, and 3. Major, minor, diminished, augmented.", exercise: "Practice all triad shapes.", tips: "Compact efficient shapes." },
  { id: 35, world: 7, title: "Fretboard Quiz", type: "quiz", lesson: "Test your fretboard knowledge!", question: "What is the 5th fret note on the A string?", options: ["C", "D", "E", "F"], correctAnswer: "D", exercise: "Complete the quiz.", tips: "Know your notes!" },
  { id: 36, world: 8, title: "Smoke on the Water", type: "riff", chord: "G", progression: "G5 - A5 - D5", pattern: "-3---3---5", tempo: 120, lesson: "The iconic Deep Purple riff. Simple power chord pattern.", exercise: "Learn the iconic riff.", tips: "Power through it!" },
  { id: 37, world: 8, title: "Seven Nation Army", type: "riff", chord: "G", progression: "G - G - G", pattern: "3-3-3-3-0-3", tempo: 116, lesson: "The White Stripes. Single-note riff that goes low to high.", exercise: "Learn the riff.", tips: "One note can be a hit!" },
  { id: 38, world: 8, title: "Iron Man", type: "riff", chord: "E", pattern: "0-2-2-0-2-0", tempo: 104, lesson: "Black Sabbath. The menacing opening riff.", exercise: "Master the opening riff.", tips: "Slow and heavy." },
  { id: 39, world: 8, title: "Back in Black", type: "riff", chord: "A", pattern: "X-0-2-2-2-0", tempo: 120, lesson: "AC/DC. A little more advanced with palm muting.", exercise: "Learn the riff with palm muting.", tips: "Mute for tightness." },
  { id: 40, world: 8, title: "Riff Challenge Boss", type: "quiz", lesson: "Master the iconic rock riffs!", question: "Which song uses primarily G5 power chords?", options: ["Smoke on the Water", "Seven Nation Army", "Iron Man", "Back in Black"], correctAnswer: "Smoke on the Water", exercise: "Complete the quiz.", tips: "Rock on!" },
  { id: 41, world: 9, title: "Travis Picking", type: "technique", chord: "G", pattern: "T-1-2-3", tempo: 80, lesson: "The fingerpicking style popularized by Merle Travis. Thumb plays bass, fingers play melody.", exercise: "Practice the Travis pattern.", tips: "Thumb always leads." },
  { id: 42, world: 9, title: "Hammer-ons", type: "technique", pattern: "H", tempo: 90, lesson: "Pluck the string and 'hammer' your finger down to create a note without picking again.", exercise: "Practice hammer-ons.", tips: "Hit hard!" },
  { id: 43, world: 9, title: "Pull-offs", type: "technique", pattern: "P", tempo: 90, lesson: "Pull your finger off the string to sound the lower note. The reverse of hammer-ons.", exercise: "Practice pull-offs.", tips: "Pull down." },
  { id: 44, world: 9, title: "Slides", type: "technique", pattern: "/", tempo: 100, lesson: "Slide from one note to another. Creates a smooth, connected sound.", exercise: "Practice slides.", tips: "Keep pressure." },
  { id: 45, world: 9, title: "Technique Quiz", type: "quiz", lesson: "Test your technique knowledge!", question: "Which technique involves plucking a string with your finger as you lift it?", options: ["Hammer-on", "Pull-off", "Slide", "Bend"], correctAnswer: "Pull-off", exercise: "Complete the quiz.", tips: "Add flavor!" },
  { id: 46, world: 10, title: "Syncopated Rhythms", type: "strumming", pattern: "D-U-d-U", tempo: 110, lesson: "Off-beat accents and rest strokes. Essential for groovy playing.", exercise: "Practice syncopation.", tips: "Feel the groove." },
  { id: 47, world: 10, title: "Jazz Chords", type: "chord", chord: "Cmaj7", lesson: "7ths & 9ths. Cmaj7, Dm7, G7, Am7 shapes.", exercise: "Practice jazz chord shapes.", tips: "Rich sounds." },
  { id: 48, world: 10, title: "Modal Interchange", type: "chord", chord: "Db", lesson: "Borrowing chords from parallel modes. Mix major and minor palette.", exercise: "Practice modal interchange.", tips: "Color your sound." },
  { id: 49, world: 10, title: "Performance Mindset", type: "quiz", lesson: "Stage presence, audience connection, and preparing for live performance.", question: "What is the most important aspect of live performance?", options: ["Speed", "Showmanship", "Consistent practice", "Playing loud"], correctAnswer: "Consistent practice", exercise: "Complete the quiz.", tips: "Practice wins." },
  { id: 50, world: 10, title: "Graduation Level", type: "special_quiz", lesson: "Comprehensive review and Master certification. You've come a long way!", question: "Are you ready to call yourself a guitarist?", options: ["Yes!", "Absolutely!", "Definitely!", "Let's go!"], correctAnswer: "Yes!", exercise: "Claim your title!", tips: "Congratulations, guitarist!" },
];

const CONTENT_DIR = path.join(process.cwd(), "src/content/guitar");

function generateMdx(level: typeof LEVELS[0]): string {
  const frontmatter = `---
title: "${level.title}"
level: ${level.id}
world: ${level.world}
difficulty: ${level.id <= 10 ? "easy" : level.id <= 30 ? "medium" : "hard"}
xp_reward: ${50 + Math.floor(level.id / 5) * 10}
type: ${level.type}
${level.chord ? `chord: "${level.chord}"` : ""}
${level.pattern ? `pattern: "${level.pattern}"` : ""}
${level.tempo ? `tempo: ${level.tempo}` : ""}
${level.progression ? `progression: "${level.progression}"` : ""}
${level.recommendedStrumming ? `strumming: "${level.recommendedStrumming}"` : ""}
---

`;

  let quizSection = "";
  if (level.question && level.options && level.correctAnswer) {
    quizSection = `

## Quiz

**Question:** ${level.question}

${level.options.map((opt, i) => `- [ ] ${opt}`).join("\n")}

*The correct answer is marked with ✓*
`;
  }

  let songSection = "";
  if (level.progression) {
    songSection = `

## Chord Progression

\`\`\`
${level.progression}
\`\`\`

${level.recommendedStrumming ? `**Recommended Strumming:** ${level.recommendedStrumming}` : ""}
`;
  }

  return `${frontmatter}# Level ${level.id}: ${level.title}

## Lesson

${level.lesson}

## Exercise

${level.exercise}

${level.tips ? `## Tips

${level.tips}` : ""}
${quizSection}
${songSection}
`.trim();
}

function main() {
  console.log("🎸 Generating MDX content files...");

  // Create directories
  for (let world = 1; world <= 10; world++) {
    const dir = path.join(CONTENT_DIR, `world-${world}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Generate files
  let generated = 0;
  for (const level of LEVELS) {
    const worldDir = path.join(CONTENT_DIR, `world-${level.world}`);
    const fileName = `level-${level.id.toString().padStart(3, "0")}.mdx`;
    const filePath = path.join(worldDir, fileName);

    // Only generate if doesn't exist or overwrite with flag
    const content = generateMdx(level);
    fs.writeFileSync(filePath, content);
    generated++;
    console.log(`  ✓ ${filePath}`);
  }

  console.log(`\n✅ Generated ${generated} MDX files in ${CONTENT_DIR}`);
}

main();
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@example.com',
      passwordHash: 'demo',
      xp: 0,
      streak: 0,
      dailyGoal: 15,
    },
  });
  console.log(`  ✓ Created user: ${user.username}`);

  // Create courses
  const course = await prisma.course.create({
    data: {
      title: 'Guitar Fundamentals',
      language: 'en',
      description: 'Learn guitar from scratch with interactive lessons',
    },
  });
  console.log(`  ✓ Created course: ${course.title}`);

  const worlds = [
    { title: 'Beginner Basics', titleAr: 'أساسيات المبتدئين', description: 'Physical orientation and fundamentals.', icon: 'music' },
    { title: 'Open Chords', titleAr: 'الأكوردات المفتوحة', description: "The 'Big Five' essential shapes.", icon: 'git-fork' },
    { title: 'Chord Transitions', titleAr: 'الانتقال بين الأكوردات', description: 'Speed and efficiency.', icon: 'repeat' },
    { title: 'Strumming Patterns', titleAr: 'أنماط العزف', description: "Developing an 'Internal Clock.'", icon: 'waves' },
    { title: 'First Songs', titleAr: 'الأغاني الأولى', description: 'Real-world application.', icon: 'music-2' },
    { title: 'Barre Chords', titleAr: 'أكوردات القضيب', description: "The 'Intermediate Wall.'", icon: 'grip' },
    { title: 'Fretboard Mastery', titleAr: 'إتقان لوحة العزف', description: 'Navigating the neck.', icon: 'layout-grid' },
    { title: 'Rock Riffs', titleAr: ' riffs الروك', description: 'Iconic melodies.', icon: 'flame' },
    { title: 'Advanced Techniques', titleAr: 'التقنيات المتقدمة', description: 'Flavor and expression.', icon: 'zap' },
    { title: 'Master Guitarist', titleAr: 'عازف الجيتار المحترف', description: 'Theory and performance.', icon: 'crown' },
  ];

  const createdWorlds = await Promise.all(
    worlds.map((world, index) =>
      prisma.world.create({
        data: {
          courseId: course.id,
          title: world.title,
          description: world.description,
          icon: world.icon,
          orderIndex: index + 1,
          isLocked: index === 0,
        },
      })
    )
  );
  console.log(`  ✓ Created ${createdWorlds.length} worlds`);

  const levels = [
    [{ title: 'Parts of the Guitar', difficulty: 'easy' }, { title: 'Proper Posture', difficulty: 'easy' }, { title: 'Tuning Basics', difficulty: 'easy' }, { title: 'String Names & Numbers', difficulty: 'easy' }, { title: 'Beginner Basics Boss', difficulty: 'easy' }],
    [{ title: 'G Major', difficulty: 'easy' }, { title: 'C Major', difficulty: 'easy' }, { title: 'D Major', difficulty: 'easy' }, { title: 'E Minor', difficulty: 'easy' }, { title: 'Open Chords Quiz', difficulty: 'easy' }],
    [{ title: 'G → C', difficulty: 'easy' }, { title: 'C → D', difficulty: 'easy' }, { title: 'D → Em', difficulty: 'easy' }, { title: 'Em → Am', difficulty: 'easy' }, { title: 'Transition Quiz', difficulty: 'easy' }],
    [{ title: 'Down Strum', difficulty: 'easy' }, { title: 'Down-Up Pattern', difficulty: 'easy' }, { title: 'Country/Folk Pattern', difficulty: 'medium' }, { title: 'Pop Pattern', difficulty: 'medium' }, { title: 'Strumming Quiz', difficulty: 'easy' }],
    [{ title: 'Let It Be', difficulty: 'easy' }, { title: 'A Horse with No Name', difficulty: 'easy' }, { title: 'Wonderwall', difficulty: 'easy' }, { title: "Knockin' on Heaven's Door", difficulty: 'easy' }, { title: 'Song Challenge Boss', difficulty: 'easy' }],
    [{ title: 'F Major Barre', difficulty: 'medium' }, { title: 'B Minor Barre', difficulty: 'medium' }, { title: 'D Minor Barre', difficulty: 'hard' }, { title: 'Moving the Shapes', difficulty: 'hard' }, { title: 'Barre Chord Quiz', difficulty: 'medium' }],
    [{ title: 'Note Names', difficulty: 'medium' }, { title: 'Minor Pentatonic Pattern 1', difficulty: 'medium' }, { title: 'Interval Shapes', difficulty: 'medium' }, { title: 'Triads', difficulty: 'hard' }, { title: 'Fretboard Quiz', difficulty: 'medium' }],
    [{ title: 'Smoke on the Water', difficulty: 'medium' }, { title: 'Seven Nation Army', difficulty: 'easy' }, { title: 'Iron Man', difficulty: 'medium' }, { title: 'Back in Black', difficulty: 'hard' }, { title: 'Riff Challenge Boss', difficulty: 'medium' }],
    [{ title: 'Travis Picking', difficulty: 'hard' }, { title: 'Hammer-ons', difficulty: 'medium' }, { title: 'Pull-offs', difficulty: 'medium' }, { title: 'Slides', difficulty: 'medium' }, { title: 'Technique Quiz', difficulty: 'medium' }],
    [{ title: 'Syncopated Rhythms', difficulty: 'hard' }, { title: 'Jazz Chords', difficulty: 'hard' }, { title: 'Modal Interchange', difficulty: 'hard' }, { title: 'Performance Mindset', difficulty: 'hard' }, { title: 'Graduation Level', difficulty: 'hard' }],
  ];

  let levelId = 1;
  for (let worldIndex = 0; worldIndex < createdWorlds.length; worldIndex++) {
    const world = createdWorlds[worldIndex];
    const worldLevels = levels[worldIndex];

    await Promise.all(
      worldLevels.map((level, index) =>
        prisma.level.create({
          data: {
            worldId: world.id,
            title: level.title,
            description: `Learn ${level.title.toLowerCase()}`,
            difficulty: level.difficulty,
            xpReward: 50 + worldIndex * 5,
            orderIndex: index + 1,
            isLocked: index === 0,
            contentPath: `guitar/world-${worldIndex + 1}/level-${String(index + 1).padStart(3, '0')}.mdx`,
          },
        })
      )
    );
    levelId += 5;
  }
  console.log(`  ✓ Created 50 levels across 10 worlds`);

  // Create songs
  const songs = [
    { title: "Knockin' on Heaven's Door", artist: 'Bob Dylan', chords: 'G,D,Am,C', difficulty: 'easy', tempo: 70 },
    { title: 'Wonderwall', artist: 'Oasis', chords: 'Em,G,D,Am', difficulty: 'easy', tempo: 85, capo: 2 },
    { title: 'A Horse with No Name', artist: 'America', chords: 'Em,D6/9', difficulty: 'easy', tempo: 75 },
    { title: 'Let Her Go', artist: 'Passenger', chords: 'Am,G,C,F', difficulty: 'medium', tempo: 90 },
    { title: 'Hotel California', artist: 'Eagles', chords: 'Bm,F#,A,E,G,D,Em,F#m', difficulty: 'hard', tempo: 80 },
    { title: "Take Me Home", artist: 'John Denver', chords: 'G,Em,C,D', difficulty: 'easy', tempo: 65 },
    { title: 'Let It Be', artist: 'The Beatles', chords: 'C,G,Am,F', difficulty: 'easy', tempo: 75 },
    { title: 'Wish You Were Here', artist: 'Pink Floyd', chords: 'Am,G,C,F', difficulty: 'medium', tempo: 60, capo: 1 },
  ];

  await Promise.all(
    songs.map((song) =>
      prisma.song.create({
        data: song,
      })
    )
  );
  console.log(`  ✓ Created ${songs.length} songs`);

  console.log('\n✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
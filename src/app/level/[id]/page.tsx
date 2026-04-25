import { levelRepository, quizRepository } from "@/repositories";
import LevelClient from "./LevelClient";
import { getMdxContent } from "@/lib/mdx";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LevelPage({ params }: PageProps) {
  const { id } = await params;
  const levelId = parseInt(id);

  if (isNaN(levelId)) {
    return notFound();
  }

  const level = await levelRepository.getById(levelId);

  if (!level) {
    return notFound();
  }

  let mdxSource = null;
  let frontmatter = {};
  
  if (level.content_path) {
    try {
      const mdxData = await getMdxContent(level.content_path);
      mdxSource = mdxData.source;
      frontmatter = mdxData.frontmatter;
    } catch (error) {
      console.error(`Error loading MDX content for level ${levelId}:`, error);
    }
  }

  const plainLevel = JSON.parse(JSON.stringify(level));
  const quiz = await quizRepository.getByLevel(levelId);
  const plainQuiz = quiz ? JSON.parse(JSON.stringify(quiz)) : null;

  return (
    <LevelClient 
      level={plainLevel} 
      quiz={plainQuiz}
      mdxSource={mdxSource as any}
      frontmatter={frontmatter}
    />
  );
}

import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import matter from 'gray-matter';

const CONTENT_PATH = path.join(process.cwd(), 'src/content');

export async function getMdxContent(contentPath: string) {
  const fullPath = path.join(CONTENT_PATH, contentPath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Content file not found: ${fullPath}`);
  }

  const source = fs.readFileSync(fullPath, 'utf8');
  const { content, data } = matter(source);

  const mdxSource = await serialize(content, {
    scope: data,
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  });

  return {
    source: mdxSource,
    frontmatter: data,
  };
}

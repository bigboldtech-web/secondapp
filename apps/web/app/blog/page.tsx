import Link from "next/link";
import { readdir, readFile } from "fs/promises";
import path from "path";
import SiteHeader from "@/components/SiteHeader";

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
}

async function getPosts(): Promise<PostMeta[]> {
  const dir = path.join(process.cwd(), "content", "blog");
  try {
    const files = await readdir(dir);
    const posts: PostMeta[] = [];
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const raw = await readFile(path.join(dir, file), "utf8");
      const meta = parseFrontmatter(raw);
      if (meta.title) {
        posts.push({
          slug: file.replace(".md", ""),
          title: meta.title,
          description: meta.description || "",
          date: meta.date || "",
        });
      }
    }
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return meta;
}

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Blog</h1>
        <p className="text-[13px] text-text-muted mb-6">Tips, guides, and insights for buying and selling pre-owned.</p>

        {posts.length === 0 ? (
          <p className="text-text-muted text-sm py-8 text-center">No posts yet. Coming soon.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-card border border-border rounded-[10px] px-5 py-4 no-underline hover:shadow-sm transition-shadow">
                <p className="text-[10px] text-text-muted mb-1">{post.date}</p>
                <h2 className="text-[16px] font-bold text-text-primary mb-1">{post.title}</h2>
                <p className="text-[13px] text-text-secondary">{post.description}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

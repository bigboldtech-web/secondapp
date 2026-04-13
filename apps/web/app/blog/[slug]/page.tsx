import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import SiteHeader from "@/components/SiteHeader";

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2] };
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

async function getPost(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "content", "blog", `${slug}.md`);
    const raw = await readFile(filePath, "utf8");
    return parseFrontmatter(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} | Second App Blog`,
    description: post.meta.description || post.body.slice(0, 160),
    openGraph: { title: post.meta.title, description: post.meta.description },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = markdownToHtml(post.body);

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.meta.title }]} />
      <main className="mx-auto max-w-[800px] px-4 sm:px-6 py-6">
        <p className="text-[11px] text-text-muted mb-2">{post.meta.date}</p>
        <h1 className="text-2xl font-bold text-text-primary mb-4">{post.meta.title}</h1>
        <article
          className="prose prose-sm max-w-none text-text-secondary leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:mb-3 [&_strong]:text-text-primary [&_a]:text-coral [&_li]:ml-4 [&_ul]:mb-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-8 pt-4 border-t border-border">
          <Link href="/blog" className="text-[12px] text-coral font-semibold no-underline">← All posts</Link>
        </div>
      </main>
    </div>
  );
}

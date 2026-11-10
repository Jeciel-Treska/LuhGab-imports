"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, X } from "lucide-react";
import { blogDisclaimer, blogPosts, type BlogPost } from "@/data/blogPosts";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
      <span className="font-medium uppercase tracking-wider text-[#D4AF37]/80">{post.category}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock size={12} aria-hidden />
        {post.readingTime} min de leitura
      </span>
    </div>
  );
}

export default function BlogSection() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const openPost = (post: BlogPost) => {
    setActivePost(post);
    dialogRef.current?.showModal();
  };

  const closePost = () => dialogRef.current?.close();

  return (
    <section
      id="guias"
      aria-labelledby="blog-title"
      className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6"
    >
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-dark shadow-gold">
          <BookOpen size={22} strokeWidth={2.4} aria-hidden />
        </span>
        <p className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">Guias e educação</p>
        <h2 id="blog-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Suplementação com embasamento
        </h2>
      </header>

      <ul className="grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <li key={post.id} className="min-w-0">
            <article className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-dark-card p-6 transition-colors duration-300 hover:border-[#E8D8B5]/25">
              <PostMeta post={post} />
              <h3 className="break-words text-lg font-semibold leading-snug text-zinc-100">
                {post.title}
              </h3>
              <p className="break-words text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>
              <button
                type="button"
                onClick={() => openPost(post)}
                className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-[#D4AF37] transition-colors duration-300 hover:text-amber-300"
              >
                Ler Guia Completo
                <ArrowRight size={16} aria-hidden />
              </button>
            </article>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActivePost(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) closePost();
        }}
        aria-labelledby={activePost ? "blog-dialog-title" : undefined}
        className="m-0 ml-auto h-full max-h-none w-full max-w-xl overflow-y-auto border-l border-gold-subtle bg-dark-soft p-0 text-zinc-200 backdrop:bg-black/70"
      >
        {activePost && (
          <div className="flex min-h-full flex-col gap-8 p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <PostMeta post={activePost} />
              <button
                type="button"
                onClick={closePost}
                aria-label="Fechar guia"
                className="shrink-0 rounded-full border border-white/10 p-2 text-zinc-400 transition-colors hover:border-[#E8D8B5]/25 hover:text-[#D4AF37]"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <h3
              id="blog-dialog-title"
              className="break-words text-2xl font-semibold leading-tight tracking-tight text-zinc-50"
            >
              {activePost.title}
            </h3>

            <div className="flex flex-col gap-8">
              {activePost.sections.map((section) => (
                <section key={section.heading} className="flex flex-col gap-3">
                  <h4 className="text-base font-semibold text-gold-300">{section.heading}</h4>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="break-words text-sm leading-relaxed text-zinc-300">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <Link
              href={activePost.relatedLink.href}
              onClick={closePost}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-dark shadow-gold transition-transform duration-300 hover:scale-[1.02]"
            >
              {activePost.relatedLink.label}
              <ArrowRight size={16} aria-hidden />
            </Link>

            <p className="mt-auto border-t border-white/10 pt-6 text-xs leading-relaxed text-zinc-400">
              {blogDisclaimer}
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}

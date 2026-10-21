"use client";

import { useState } from "react";
import PostCard, { type PostSummary } from "./PostCard";

// Category chips over the article grid.
export default function BlogExplorer({ posts, categories }: { posts: PostSummary[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? posts : posts.filter((p) => p.category === cat);

  return (
    <>
      <div className="noscroll -mx-[var(--mx)] mb-8 flex gap-2 overflow-x-auto px-[var(--mx)]" role="group" aria-label="Filter by topic">
        {["All", ...categories].map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                on
                  ? "border-navy bg-navy text-white shadow-[0_8px_20px_-10px_rgb(19_41_75/0.6)]"
                  : "border-line bg-white text-ink hover:-translate-y-0.5 hover:border-navy"
              }`}
            >
              {c}
              <span className={`num ml-2 text-xs ${on ? "text-white/70" : "text-faint"}`}>
                {c === "All" ? posts.length : posts.filter((p) => p.category === c).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <div key={p.slug} data-reveal style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
            <PostCard post={p} />
          </div>
        ))}
      </div>
    </>
  );
}

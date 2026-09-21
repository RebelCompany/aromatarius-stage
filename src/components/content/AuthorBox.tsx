import Link from "next/link";
import { pl } from "@/i18n/pl";
import { formatDate } from "@/lib/format";

type Props = { publishedAt: string; updatedAt: string; readingMinutes?: number };

/** Auteur identifié + dates : signal E-E-A-T (docs/04). */
export function AuthorBox({ publishedAt, updatedAt, readingMinutes }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
      <p>
        {pl.content.author}:{" "}
        <Link href="/o-nas" className="font-medium text-leaf-900 hover:underline">
          Bogusia, Aromatarius
        </Link>
      </p>
      <p>
        {pl.content.publishedAt}: <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
      </p>
      {updatedAt !== publishedAt && (
        <p>
          {pl.content.updatedAt}: <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </p>
      )}
      {readingMinutes ? <p>{readingMinutes} min czytania</p> : null}
    </div>
  );
}

export function Sources({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby="sources-title" className="mt-10 border-t border-sand-200 pt-6">
      <h2 id="sources-title" className="text-lg">
        {pl.content.sources}
      </h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-600">
        {sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}

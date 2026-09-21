import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  description: string;
  eyebrow?: string;
  meta?: string;
  className?: string;
};

/** Carte éditoriale (blog, receptury, kompendium). */
export function ContentCard({ href, title, description, eyebrow, meta, className }: Props) {
  return (
    <article className={cn("relative flex h-full flex-col rounded-md border border-sand-200 bg-card p-5 transition-shadow hover:shadow-md", className)}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-leaf-500">{eyebrow}</p>}
      <h3 className="text-lg leading-snug">
        <Link href={href} className="after:absolute after:inset-0 hover:text-leaf-700">
          {title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-ink-600">{description}</p>
      {meta && <p className="mt-auto pt-3 text-xs text-ink-600">{meta}</p>}
    </article>
  );
}

import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/shopify/types";
import { faqSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { items: Faq[]; title?: string; withSchema?: boolean; id?: string };

/** FAQ rendue serveur avec <details> natif + FAQPage schema (docs/04). */
export function FaqAccordion({ items, title, withSchema = true, id = "faq" }: Props) {
  if (!items.length) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      {withSchema && <JsonLd data={faqSchema(items)} />}
      {title && (
        <h2 id={`${id}-title`} className="mb-4">
          {title}
        </h2>
      )}
      <div className="divide-y divide-sand-200 rounded-md border border-sand-200 bg-card">
        {items.map((f, i) => (
          <details key={i} className="group px-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.pytanie}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="prose-aroma pb-4 text-[0.95rem]" dangerouslySetInnerHTML={{ __html: f.odpowiedzHtml }} />
          </details>
        ))}
      </div>
    </section>
  );
}

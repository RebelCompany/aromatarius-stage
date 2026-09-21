import type { Thing, WithContext } from "schema-dts";

type Props = { data: WithContext<Thing> | WithContext<Thing>[] | null | undefined };

/** JSON-LD typé avec schema-dts (règle 4 de CLAUDE.md). */
export function JsonLd({ data }: Props) {
  if (!data) return null;
  const items = Array.isArray(data) ? data.filter(Boolean) : [data];
  if (!items.length) return null;
  return (
    <script
      type="application/ld+json"
      // Échappe "<" pour éviter toute injection via le contenu
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, "\\u003c"),
      }}
    />
  );
}

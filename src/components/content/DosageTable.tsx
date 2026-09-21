import { pl } from "@/i18n/pl";
import type { Dosage } from "@/lib/shopify/types";

export function DosageTable({ rows, caption }: { rows: Dosage[]; caption?: string }) {
  if (!rows.length) return null;
  return (
    <table className="my-4 w-full border-collapse overflow-hidden rounded-md text-sm">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="bg-leaf-100 text-left">
          <th scope="col" className="px-3 py-2 font-semibold">
            {pl.product.dosageMethod}
          </th>
          <th scope="col" className="px-3 py-2 font-semibold">
            {pl.product.dosageDose}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.metoda} className="border-b border-sand-200">
            <th scope="row" className="px-3 py-2 text-left font-medium">
              {r.metoda}
            </th>
            <td className="px-3 py-2">{r.dawka}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

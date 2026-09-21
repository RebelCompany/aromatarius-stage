import Link from "next/link";
import { pl, t } from "@/i18n/pl";
import { blogLink, knowledgeLinks, legalLinks, promoLink, typeCollections } from "@/lib/navigation";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-sand-200 bg-leaf-100/60">
      <section id="newsletter" className="border-b border-sand-200" aria-labelledby="newsletter-title">
        <div className="container-page grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 id="newsletter-title" className="text-2xl">
              {pl.newsletter.title}
            </h2>
            <p className="mt-2 text-ink-600">{pl.newsletter.text}</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-semibold text-leaf-900">{pl.brand.name}</p>
          <p className="mt-2 text-sm text-ink-600">{pl.brand.tagline}</p>
          <p className="mt-3 text-sm">
            <a href={`tel:${pl.brand.phone.replace(/\s/g, "")}`} className="hover:underline">
              {pl.brand.phone}
            </a>
            <br />
            <a href={`mailto:${pl.brand.email}`} className="hover:underline">
              {pl.brand.email}
            </a>
          </p>
        </div>
        <FooterColumn title={pl.footer.shop} links={[...typeCollections.map((c) => ({ href: `/${c.handle}`, title: c.title })), promoLink]} />
        <FooterColumn title={pl.footer.knowledge} links={[...knowledgeLinks, blogLink, { href: "/o-nas", title: pl.nav.about }]} />
        <FooterColumn title={pl.footer.help} links={[{ href: "/kontakt", title: pl.nav.contact }, ...legalLinks]} />
      </div>

      <div className="border-t border-sand-200">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{t(pl.footer.copyright, { year })}</p>
          <p>
            {pl.footer.payments} · {pl.footer.delivery}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; title: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-600">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-leaf-700 hover:underline">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

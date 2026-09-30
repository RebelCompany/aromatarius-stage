import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FlaskConical, Handshake, Percent, Sparkles, Store, Stethoscope } from "lucide-react";
import { pl } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageBanner } from "@/components/layout/PageBanner";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: `${pl.b2b.pageTitle} | Aromatarius`,
    description: pl.b2b.pageIntro,
    path: "/dla-profesjonalistow",
  });
}

const profiles = [
  { icon: Stethoscope, title: pl.b2b.profile1Title, text: pl.b2b.profile1Text },
  { icon: Store, title: pl.b2b.profile2Title, text: pl.b2b.profile2Text },
  { icon: Sparkles, title: pl.b2b.profile3Title, text: pl.b2b.profile3Text },
];

const benefits = [
  { icon: Percent, title: pl.b2b.benefit1Title, text: pl.b2b.benefit1Text },
  { icon: FlaskConical, title: pl.b2b.benefit2Title, text: pl.b2b.benefit2Text },
  { icon: Sparkles, title: pl.b2b.benefit3Title, text: pl.b2b.benefit3Text },
  { icon: Handshake, title: pl.b2b.benefit4Title, text: pl.b2b.benefit4Text },
];

export default function ProfessionalsPage() {
  return (
    <div className="container-page py-6 md:py-10">
      <Breadcrumbs items={[{ name: pl.b2b.pageTitle, href: "/dla-profesjonalistow" }]} className="mb-4" />
      <PageBanner title={pl.b2b.pageTitle} intro={pl.b2b.pageIntro} />

      {/* Trois profils : visuel a gauche, texte a droite, comme la reference */}
      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start" aria-labelledby="profile-title">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-leaf-100">
          <Image
            src="/images/collection-banner.svg"
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, 100vw"
            unoptimized
            className="object-cover"
          />
        </div>

        <div>
          <h2 id="profile-title">{pl.b2b.profilesTitle}</h2>
          <ul className="mt-6 divide-y divide-sand-200">
            {profiles.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 py-5 first:pt-0">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sand-200" aria-hidden>
                  <Icon className="size-5 text-leaf-700" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-leaf-900">{title}</h3>
                  <p className="mt-1 max-w-prose text-ink-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 rounded-md bg-leaf-100/60 px-6 py-10 md:px-10" aria-labelledby="benefits-title">
        <h2 id="benefits-title">{pl.b2b.benefitsTitle}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-leaf-700" strokeWidth={1.5} aria-hidden />
              <div>
                <h3 className="text-base font-semibold text-leaf-900">{title}</h3>
                <p className="mt-1 text-ink-600">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/wspolpraca"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-leaf-900 px-6 text-base font-medium text-cream-50 hover:bg-leaf-700"
        >
          {pl.b2b.calloutCta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}

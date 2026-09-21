import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Callout } from "./Callout";
import { DosageTable } from "./DosageTable";

const components = {
  Callout,
  DosageTable,
  a: ({ href = "", children, ...rest }: React.ComponentProps<"a">) => {
    const internal = href.startsWith("/") || href.startsWith("#");
    return internal ? (
      <Link href={href} {...rest}>
        {children}
      </Link>
    ) : (
      <a href={href} rel="noopener noreferrer" target="_blank" {...rest}>
        {children}
      </a>
    );
  },
  table: (props: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

/** Rendu MDX côté serveur (RSC), GFM + ancres sur les titres. */
export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
        },
      }}
    />
  );
}

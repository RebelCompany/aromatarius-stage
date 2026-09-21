import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/** Lien stylé comme un bouton (évite le `render` de Base UI sur un <a>). */
export function ButtonLink({ className, variant, size, ...props }: Props) {
  return <Link data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

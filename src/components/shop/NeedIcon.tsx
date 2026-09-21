import { Activity, Baby, Flower2, HeartHandshake, Home, Leaf, Moon, Shield, Soup, Sparkles, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  sen: Moon,
  stres: HeartHandshake,
  odpornosc: Shield,
  oddychanie: Wind,
  skora: Sparkles,
  trawienie: Soup,
  bol: Activity,
  dzieci: Baby,
  dom: Home,
  pielegnacja: Flower2,
};

/** Icône partagée d'un besoin (tuiles home, finder). */
export function NeedIcon({ need, className }: { need: string; className?: string }) {
  const Icon = icons[need] ?? Leaf;
  return <Icon className={cn("size-8 text-leaf-500", className)} strokeWidth={1.5} aria-hidden />;
}

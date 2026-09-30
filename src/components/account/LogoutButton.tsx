import { LogOut } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

/**
 * Deconnexion en POST vers un Route Handler : le flux OAuth se termine par des
 * redirections, et la session Shopify doit etre fermee de son cote. Formulaire
 * plutot que bouton client, pour que ca marche aussi sans JavaScript.
 */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/konto/wyloguj" method="post">
      <button
        type="submit"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-lg border border-sand-200 px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-leaf-100",
          className,
        )}
      >
        <LogOut className="size-4" aria-hidden />
        {pl.account.logout}
      </button>
    </form>
  );
}

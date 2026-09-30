"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentCustomerAction } from "@/lib/shopify/actions";
import type { Customer } from "@/lib/shopify/types";

type CustomerContextValue = {
  customer: Customer | null;
  /** true tant que la session n'a pas ete lue : evite d'afficher "Zaloguj sie" a un connecte. */
  loading: boolean;
  refresh: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

/**
 * Session client cote navigateur. Le jeton reste dans un cookie httpOnly :
 * ce store ne contient que l'identite, jamais le jeton (regle des cookies
 * du panier, appliquee au compte).
 */
export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const c = await getCurrentCustomerAction();
    setCustomer(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentCustomerAction()
      .then((c) => {
        if (active) {
          setCustomer(c);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ customer, loading, refresh }), [customer, loading, refresh]);
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer doit être utilisé dans <CustomerProvider>");
  return ctx;
}

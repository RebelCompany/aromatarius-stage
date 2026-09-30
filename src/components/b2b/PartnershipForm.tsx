"use client";

import { useId, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { partnerKinds, type PartnershipErrors, type PartnershipField } from "@/lib/b2b";
import { submitPartnershipAction } from "@/lib/shopify/actions";
import { Button } from "@/components/ui/button";

export function PartnershipForm() {
  const id = useId();
  const [errors, setErrors] = useState<PartnershipErrors>({});
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setErrors({});
    setFailed(false);
    startTransition(async () => {
      const result = await submitPartnershipAction(data);
      if (result.ok) {
        setDone(true);
        return;
      }
      if ("errors" in result) setErrors(result.errors);
      else setFailed(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-md border border-leaf-500/40 bg-leaf-100 p-6" role="status">
        <p className="flex items-center gap-2 font-serif text-xl text-leaf-900">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          {pl.b2b.successTitle}
        </p>
        <p className="mt-2 text-ink-600">{pl.b2b.successText}</p>
      </div>
    );
  }

  const err = (field: PartnershipField) => (errors[field] ? pl.b2b.errors[errors[field] as "required" | "invalid"] : undefined);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field id={`${id}-name`} name="fullName" label={pl.b2b.fullName} autoComplete="name" error={err("fullName")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-company`} name="company" label={pl.b2b.company} autoComplete="organization" error={err("company")} />
        <Field id={`${id}-nip`} name="nip" label={pl.b2b.nip} hint={pl.b2b.nipHint} inputMode="numeric" error={err("nip")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-email`} name="email" type="email" label={pl.b2b.email} autoComplete="email" error={err("email")} />
        <Field
          id={`${id}-phone`}
          name="phone"
          type="tel"
          label={`${pl.b2b.phone} (${pl.b2b.phoneOptional})`}
          autoComplete="tel"
          required={false}
          error={err("phone")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-kind`} className="text-sm font-medium text-leaf-900">
          {pl.b2b.kind}
        </label>
        <select
          id={`${id}-kind`}
          name="kind"
          defaultValue=""
          required
          aria-invalid={err("kind") ? true : undefined}
          aria-describedby={err("kind") ? `${id}-kind-error` : undefined}
          className="h-12 rounded-lg border border-sand-200 bg-card px-4 text-base text-ink-900 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/40"
        >
          <option value="" disabled>
            {pl.b2b.kindPlaceholder}
          </option>
          {partnerKinds.map((k) => (
            <option key={k} value={k}>
              {pl.b2b.kinds[k]}
            </option>
          ))}
        </select>
        {err("kind") && (
          <p id={`${id}-kind-error`} className="text-sm text-danger" role="alert">
            {err("kind")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-message`} className="text-sm font-medium text-leaf-900">
          {pl.b2b.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          required
          aria-invalid={err("message") ? true : undefined}
          aria-describedby={err("message") ? `${id}-message-error` : `${id}-message-hint`}
          className="rounded-lg border border-sand-200 bg-card p-4 text-base text-ink-900 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/40"
        />
        {err("message") ? (
          <p id={`${id}-message-error`} className="text-sm text-danger" role="alert">
            {err("message")}
          </p>
        ) : (
          <p id={`${id}-message-hint`} className="text-xs text-ink-600">
            {pl.b2b.messageHint}
          </p>
        )}
      </div>

      {failed && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
          {t(pl.b2b.failed, { email: pl.brand.email })}
        </p>
      )}

      <p className="text-xs text-ink-600">{pl.b2b.consent}</p>

      <Button type="submit" size="lg" className="h-12 self-start bg-leaf-900 px-8 text-base hover:bg-leaf-700" disabled={pending}>
        {pending ? pl.b2b.sending : pl.b2b.submit}
      </Button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  hint,
  error,
  autoComplete,
  inputMode,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
  required?: boolean;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-leaf-900">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="h-12 rounded-lg border border-sand-200 bg-card px-4 text-base text-ink-900 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/40"
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

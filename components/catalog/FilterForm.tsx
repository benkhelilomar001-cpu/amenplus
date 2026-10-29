"use client";

import Form from "next/form";

/** GET form (works without JS). With JS, selects apply immediately and navigation stays client-side. */
export function FilterForm({ action, children, className }: { action: string; children: React.ReactNode; className?: string }) {
  return (
    <Form
      action={action}
      className={className}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement) e.currentTarget.requestSubmit();
      }}
    >
      {children}
    </Form>
  );
}

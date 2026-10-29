"use client";

import { useEffect } from "react";
import LostInSpace from "@/components/LostInSpace";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <LostInSpace
      code="Signal lost"
      title="Something went wrong on our side"
      body="Try again in a moment. If it keeps happening, email us at ecell@bimtech.ac.in."
      action={
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-accent-100 transition-colors"
        >
          Try again
        </button>
      }
    />
  );
}

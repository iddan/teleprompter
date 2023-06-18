"use client";

import { FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const entries = Array.from(data.entries()) as [string, string][];
      router.push(`/prompter?${new URLSearchParams(entries)}`);
    },
    [router]
  );

  return (
    <form className={styles.main} onSubmit={handleSubmit}>
      <textarea name="text" placeholder="הטקסט" rows={10} required />
      <label>
        מהירות:{" "}
        <input
          name="speed"
          type="range"
          min="0"
          max="10"
          step={1}
          defaultValue={5}
        />
      </label>
      <label>
        טיימר:{" "}
        <input name="timer" type="number" step={1} min="0" defaultValue={3} />{" "}
        שניות
      </label>

      <button type="submit">הפעל</button>
    </form>
  );
}

"use client";

import { FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home({
  searchParams,
}: {
  searchParams: { text: string; speed: string; timer: string };
}) {
  const router = useRouter();

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const entries = Array.from(data.entries()) as [string, string][];
      const searchParams = new URLSearchParams(entries);
      router.replace(`/?${searchParams}`);
      setTimeout(() => {
        router.push(`/prompter?${searchParams}`);
      }, 100);
    },
    [router]
  );

  return (
    <form className={styles.main} onSubmit={handleSubmit}>
      <h1>טלפרומפטר</h1>
      <textarea
        name="text"
        placeholder="הטקסט"
        rows={9}
        required
        defaultValue={searchParams.text || ""}
      />
      <label>
        מהירות:{" "}
        <input
          name="speed"
          type="range"
          min="0"
          max="10"
          step={1}
          defaultValue={searchParams.speed || 5}
        />
      </label>
      <label>
        טיימר:{" "}
        <input
          name="timer"
          type="number"
          step={1}
          min="0"
          defaultValue={searchParams.timer || 3}
        />{" "}
        שניות
      </label>

      <button type="submit">הפעל</button>
    </form>
  );
}

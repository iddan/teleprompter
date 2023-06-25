"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import useInterval from "../use-interval";
import getFirstVisibleChildIndex from "../get-visible-first-child-index";
import styles from "./page.module.css";

export default function Prompter() {
  const searchParams = useSearchParams();
  const text = searchParams.get("text")!;
  const speed = parseInt(searchParams.get("speed")!);
  const timer = parseInt(searchParams.get("timer")!);

  const [playing, setPlaying] = useState(false);
  const [timerActive, setTimerActive] = useState(Boolean(timer));
  const [highlightedWordsByParagraph, setHighlightedWordsByParagraph] =
    useState<number[]>([]);

  const mainRef = useRef<HTMLElement>(null);
  const contentSectionRef = useRef<HTMLElement>(null);

  const interval = useInterval();

  const paragraphs = useMemo(() => text.split("\n").filter(Boolean), [text]);

  const pause = useCallback(() => {
    interval.clear();
    setPlaying(false);
  }, [interval]);

  const play = useCallback(() => {
    const delay = 1500 / speed;

    const contentSection = contentSectionRef.current;

    if (!contentSection) throw new Error("No content section");

    // cleanup
    const paragraphIndex = getFirstVisibleChildIndex(
      document.documentElement.scrollTop,
      contentSection
    );

    if (paragraphIndex === null) return;

    setHighlightedWordsByParagraph((prev) => {
      const next = prev.slice(0, paragraphIndex).map((_, i) => {
        return paragraphs[i].split(" ").length;
      });
      next[paragraphIndex] = 0;
      return next;
    });

    // every tick

    let currentParagraphIndex = paragraphIndex;
    let seenWords = 0;

    interval.set(() => {
      const paragraphIndex = getFirstVisibleChildIndex(
        document.documentElement.scrollTop,
        contentSection
      );

      if (paragraphIndex === null) return;

      if (currentParagraphIndex !== paragraphIndex) {
        currentParagraphIndex = paragraphIndex;
        seenWords = 0;
        setHighlightedWordsByParagraph((prev) => {
          const next = [...prev];
          next[paragraphIndex] = 0;
          return next;
        });
      }

      const paragraph = contentSection.children[paragraphIndex];

      if (!(paragraph instanceof HTMLParagraphElement)) return;

      const words = paragraph.textContent!.split(" ");

      if (seenWords !== words.length) {
        seenWords++;
        setHighlightedWordsByParagraph((prev) => {
          const next = [...prev];
          next[paragraphIndex] = seenWords;
          return next;
        });
        return;
      }

      const nextParagraph = contentSection.children[paragraphIndex + 1];

      if (nextParagraph) {
        nextParagraph.scrollIntoView({ behavior: "smooth" });
      } else {
        pause();
      }
    }, delay);

    setPlaying(true);
  }, [interval, paragraphs, speed, pause]);

  const handleClick = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  useEffect(() => {
    mainRef.current?.requestFullscreen({
      navigationUI: "hide",
    });
  }, [mainRef]);

  useEffect(() => {
    window.scrollTo(0, 0);

    let lastScroll = 0;
    const handleScroll = () => {
      const scrollingUp = lastScroll - window.scrollY > 0;
      if (scrollingUp) pause();
      lastScroll = window.scrollY;
    };

    setTimeout(() => {
      setTimerActive(false);
      addEventListener("scroll", handleScroll);
      play();
    }, timer * 1000);

    return () => removeEventListener("scroll", handleScroll);
  }, [play, pause, timer]);

  return (
    <main className={styles.main} onClick={handleClick} ref={mainRef}>
      {timerActive && <Countdown start={timer} />}
      {!timerActive && !playing && <div className={styles.pause}>⏸</div>}
      <section ref={contentSectionRef}>
        {paragraphs.map((paragraph, i) => {
          const highlightedWords = highlightedWordsByParagraph[i];
          return (
            <p key={i}>
              {paragraph.split(" ").map((word, j) => (
                <>
                  <span
                    key={j}
                    className={j < highlightedWords ? styles.seen : undefined}
                  >
                    {word}
                  </span>{" "}
                </>
              ))}
            </p>
          );
        })}
      </section>
    </main>
  );
}

const Countdown = ({ start }: { start: number }) => {
  const [value, setValue] = useState(start);
  const interval = useInterval();
  useEffect(() => {
    interval.set(() => {
      setValue((prevValue) => prevValue - 1);
    }, 1000);
    return () => interval.clear();
  });
  return <div className={styles.countdown}>{value}</div>;
};

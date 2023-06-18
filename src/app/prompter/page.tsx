"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function Prompter({
  params,
  searchParams,
}: {
  params: {};
  searchParams: { text: string; speed: string; timer: string };
}) {
  const { text } = searchParams;
  const paragraphs = text.split("\n").filter(Boolean);
  const speed = parseInt(searchParams.speed);
  const timer = parseInt(searchParams.timer);
  const intervalRef = useRef<NodeJS.Timer>();
  const [playing, setPlaying] = useState(false);
  const [timerActive, setTimerActive] = useState(Boolean(timer));

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      window.scrollBy(0, 144);
    }, 1000 * speed);
    setPlaying(true);
  }, [speed]);

  const handleClick = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  useEffect(() => {
    window.scrollTo(0, 0);

    let lastScroll = 0;
    const handleScroll = (event: Event) => {
      if (lastScroll - window.scrollY > 0) pause();
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
    <main className={styles.main} onClick={handleClick}>
      {timerActive && <Countdown start={timer} />}
      {!timerActive && !playing && <div className={styles.pause}>⏸</div>}
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </main>
  );
}

const Countdown = ({ start }: { start: number }) => {
  const [value, setValue] = useState(start);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prevValue) => prevValue - 1);
    }, 1000);
    return () => clearInterval(interval);
  });
  return <div className={styles.countdown}>{value}</div>;
};

"use client";

import { useCallback, useMemo, useRef } from "react";

export default function useInterval(): {
  clear: () => void;
  set: (callback: () => void, delay: number) => void;
} {
  const intervalRef = useRef<NodeJS.Timer>();

  const clear = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  }, []);

  const set = useCallback((callback: () => void, delay: number) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(callback, delay);
  }, []);

  return useMemo(() => ({ clear, set }), [clear, set]);
}

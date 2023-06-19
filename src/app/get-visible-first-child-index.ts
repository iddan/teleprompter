"use client";

export default function getFirstVisibleChildIndex(
  scrollTop: number,
  element: HTMLElement
): number | null {
  let acc = 0;
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    if (child instanceof HTMLElement) {
      const boundingRect = child.getBoundingClientRect();
      if (scrollTop < acc + boundingRect.height) {
        return i;
      }
      acc += boundingRect.height;
    }
  }
  return null;
}

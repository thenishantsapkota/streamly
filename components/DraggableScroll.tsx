"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Horizontal-scroll container that's draggable with a mouse on desktop.
 * Touch is left to native overflow-x scrolling — the browser handles momentum
 * and click cancellation better than userland code.
 */
export function DraggableScroll({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      // Don't start drag from form controls
      const target = e.target as HTMLElement;
      if (target.closest("input, button, select, textarea")) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };

    const onPointerUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
      el.style.userSelect = "";
      if (moved) {
        // Suppress the click that fires at the end of a drag.
        const block = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          window.removeEventListener("click", block, true);
        };
        window.addEventListener("click", block, true);
      }
    };

    // Browsers natively start an HTML5 drag operation when the user mouses
    // down on an <img> or <a> — that hijacks the gesture and our pointermove
    // handler never gets to scroll the carousel. Cancelling dragstart lets the
    // pointer events flow through normally.
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    // While dragging the carousel, also suppress text selection so highlighting
    // doesn't kick in mid-drag.
    const onSelectStart = (e: Event) => {
      if (isDown) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("selectstart", onSelectStart);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("selectstart", onSelectStart);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ touchAction: "manipulation", cursor: "grab" }}
    >
      {children}
    </div>
  );
}

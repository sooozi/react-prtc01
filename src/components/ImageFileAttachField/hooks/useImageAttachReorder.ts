import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { arrayMove } from "@/utils/arrayMove";
import type { ReorderGhostState } from "../ui/ReorderGhostPortal";

export type ImageAttachRowDisplay = {
  fileName: string;
  sizeLabel: string;
};

type UseImageAttachReorderOptions<T> = {
  items: readonly T[];
  onReorder: (next: T[]) => void;
  getRowDisplay: (item: T, index: number) => ImageAttachRowDisplay;
};

export function useImageAttachReorder<T>({
  items,
  onReorder,
  getRowDisplay,
}: UseImageAttachReorderOptions<T>) {
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [reorderFromIndex, setReorderFromIndex] = useState<number | null>(null);
  const [reorderGhost, setReorderGhost] = useState<ReorderGhostState | null>(null);

  const reorderFromRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef(items);
  const onReorderRef = useRef(onReorder);
  const overIndexRef = useRef<number | null>(null);
  const pointerReorderDetachRef = useRef<(() => void) | null>(null);
  const reorderGhostRef = useRef<ReorderGhostState | null>(null);
  const ghostMoveRafRef = useRef<number | null>(null);
  const pendingGhostPointerRef = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    itemsRef.current = items;
    onReorderRef.current = onReorder;
  }, [items, onReorder]);

  useEffect(() => {
    return () => {
      pointerReorderDetachRef.current?.();
      pointerReorderDetachRef.current = null;
    };
  }, []);

  const clearReorderGhost = () => {
    if (ghostMoveRafRef.current != null) {
      cancelAnimationFrame(ghostMoveRafRef.current);
      ghostMoveRafRef.current = null;
    }
    pendingGhostPointerRef.current = null;
    reorderGhostRef.current = null;
    setReorderGhost(null);
  };

  const clearReorderVisual = () => {
    clearReorderGhost();
    reorderFromRef.current = null;
    overIndexRef.current = null;
    setReorderFromIndex(null);
    setOverIndex(null);
  };

  const scheduleReorderGhostMove = (clientX: number, clientY: number) => {
    pendingGhostPointerRef.current = { x: clientX, y: clientY };
    if (ghostMoveRafRef.current != null) return;

    ghostMoveRafRef.current = requestAnimationFrame(() => {
      ghostMoveRafRef.current = null;
      const p = pendingGhostPointerRef.current;
      const g = reorderGhostRef.current;
      if (!p || !g) return;

      const next: ReorderGhostState = {
        ...g,
        left: p.x - g.offsetX,
        top: p.y - g.offsetY,
      };
      reorderGhostRef.current = next;
      setReorderGhost(next);
    });
  };

  const updateOverFromPoint = (clientX: number, clientY: number) => {
    const root = rootRef.current;
    if (!root) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }

    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !root.contains(el)) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }

    const row = el.closest("[data-reorder-index]") as HTMLElement | null;
    if (!row) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }

    const raw = row.getAttribute("data-reorder-index");
    const idx = raw == null ? NaN : parseInt(raw, 10);
    if (Number.isNaN(idx)) {
      overIndexRef.current = null;
      setOverIndex(null);
      return;
    }

    overIndexRef.current = idx;
    setOverIndex(idx);
  };

  const bindPointerReorderSession = (startIndex: number, pointerId: number) => {
    pointerReorderDetachRef.current?.();

    document.body.classList.add("image-file-attach--reorder-active");

    reorderFromRef.current = startIndex;
    overIndexRef.current = null;
    setReorderFromIndex(startIndex);
    setOverIndex(null);

    let ended = false;
    const moveOpts: AddEventListenerOptions = { passive: true };

    const detach = () => {
      if (ended) return;
      ended = true;
      document.removeEventListener("pointermove", onMove, moveOpts);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onUp, true);
      document.body.classList.remove("image-file-attach--reorder-active");
      pointerReorderDetachRef.current = null;
      clearReorderVisual();
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      scheduleReorderGhostMove(ev.clientX, ev.clientY);
      updateOverFromPoint(ev.clientX, ev.clientY);
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const from = reorderFromRef.current;
      const to = overIndexRef.current;
      detach();
      if (from != null && to != null && from !== to) {
        onReorderRef.current(arrayMove([...itemsRef.current], from, to));
      }
    };

    pointerReorderDetachRef.current = detach;

    document.addEventListener("pointermove", onMove, moveOpts);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
  };

  const handleReorderPointerDown =
    (index: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (items.length < 2) return;

      e.preventDefault();
      e.stopPropagation();

      const row = (e.currentTarget as HTMLElement).closest(
        "[data-reorder-index]"
      ) as HTMLElement | null;
      if (!row) return;

      const item = items[index];
      if (item == null) return;

      const rect = row.getBoundingClientRect();
      const { fileName, sizeLabel } = getRowDisplay(item, index);
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const initial: ReorderGhostState = {
        left: e.clientX - offsetX,
        top: e.clientY - offsetY,
        width: rect.width,
        offsetX,
        offsetY,
        fileName,
        sizeLabel,
      };

      reorderGhostRef.current = initial;
      setReorderGhost(initial);
      bindPointerReorderSession(index, e.pointerId);
    };

  const getRowClassName = (index: number) =>
    [
      "image-file-attach__row",
      "image-file-attach__row--reorder",
      overIndex === index && reorderFromIndex != null && reorderFromIndex !== index
        ? "image-file-attach__row--over"
        : "",
      reorderFromIndex === index ? "image-file-attach__row--dragging" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return {
    rootRef: rootRef as RefObject<HTMLDivElement>,
    reorderGhost,
    getRowClassName,
    handleReorderPointerDown,
  };
}

import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { getTabbableElements } from "@/utils/tabbable";

let scrollLockCount = 0;

function syncBodyOverflow() {
  if (typeof document === "undefined") return;
  document.body.style.overflow = scrollLockCount > 0 ? "hidden" : "";
}

/** 여러 레이어가 겹쳐도 마지막이 닫힐 때만 본문 스크롤이 풀리도록 카운트한다. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    scrollLockCount += 1;
    syncBodyOverflow();
    return () => {
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      syncBodyOverflow();
    };
  }, [locked]);
}

export type FloatingFocusInitial = "first-tabbable" | "none";
export type FloatingRestoreFocusMode = "previous" | "target-if-inside";

export interface UseFloatingLayerOptions {
  open: boolean;
  /** false면 훅 전체 비활성 (예: 모바일 전용 드로어) */
  enabled?: boolean;
  layerRootRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
  lockScroll?: boolean;
  trapTab?: boolean;
  /** null이면 포커스 저장·복귀·초기 이동 없음 */
  focusInitial?: FloatingFocusInitial | null;
  /** null이면 닫을 때 포커스 복귀 없음 */
  restoreFocusMode?: FloatingRestoreFocusMode | null;
  /** restoreFocusMode === "target-if-inside"일 때 필수 */
  restoreLayerRef?: RefObject<HTMLElement | null>;
  restoreTargetRef?: RefObject<HTMLElement | null>;
}

/**
 * 떠 있는 UI 공통: Esc(document 캡처 + preventDefault), 선택적 스크롤 잠금,
 * 선택적 Tab 트랩, 선택적 포커스(열 때 이동 / 닫을 때 복귀).
 */
export function useFloatingLayer({
  open,
  enabled = true,
  layerRootRef,
  onEscape,
  lockScroll = false,
  trapTab = false,
  focusInitial = null,
  restoreFocusMode = null,
  restoreLayerRef,
  restoreTargetRef,
}: UseFloatingLayerOptions): void {
  const active = open && enabled;
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useBodyScrollLock(active && lockScroll);

  useLayoutEffect(() => {
    if (!active || (focusInitial === null && restoreFocusMode === null)) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const layerSnapshot =
      restoreFocusMode === "target-if-inside" && restoreLayerRef ? restoreLayerRef.current : null;
    const targetSnapshot =
      restoreFocusMode === "target-if-inside" && restoreTargetRef ? restoreTargetRef.current : null;

    if (focusInitial === "first-tabbable") {
      const panel = layerRootRef.current;
      const move = () => {
        if (!panel) return;
        const list = getTabbableElements(panel);
        (list[0] ?? panel).focus();
      };
      queueMicrotask(move);
    }

    return () => {
      if (restoreFocusMode === "previous") {
        if (previouslyFocused?.isConnected) {
          previouslyFocused.focus({ preventScroll: true });
        }
        return;
      }
      if (
        restoreFocusMode === "target-if-inside" &&
        layerSnapshot?.isConnected &&
        targetSnapshot?.isConnected
      ) {
        const activeEl = document.activeElement;
        if (activeEl instanceof Node && layerSnapshot.contains(activeEl)) {
          targetSnapshot.focus({ preventScroll: true });
        }
      }
    };
  }, [active, focusInitial, restoreFocusMode, layerRootRef, restoreLayerRef, restoreTargetRef]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (!trapTab || e.key !== "Tab") return;
      const panel = layerRootRef.current;
      if (!panel) return;
      const list = getTabbableElements(panel);
      if (list.length === 0) return;
      const activeEl = document.activeElement;
      if (!(activeEl instanceof HTMLElement) || !panel.contains(activeEl)) return;

      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [active, trapTab, layerRootRef]);
}

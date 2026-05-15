import clsx from "clsx";
import { useEffect, useLayoutEffect } from "react";
import type { ReactNode, RefObject } from "react";
import { useFloatingLayer } from "@/hooks/useFloatingLayer";

type CalendarPickerPopoverProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  /** listbox 패널용 접근 가능 이름 (스크린 리더) */
  listboxLabel: string;
  isOpen: boolean;
  /** Esc 또는 트리거·패널 바깥 pointerdown 시 호출 (이 팝오버만 닫기) */
  onDismiss: () => void;
  onTriggerClick: () => void;
  triggerClassName: string;
  /** 연도 패널 등 추가 그리드/스크롤용 클래스 */
  popoverExtraClassName?: string;
  /** 트리거 안에 보여 줄 라벨 */
  triggerDisplay: ReactNode;
  children: ReactNode;
};

/** 연도·월: 트리거 버튼 + 숨김/표시 패널 */
export function CalendarPickerPopover({
  buttonRef,
  popoverRef,
  popoverId,
  listboxLabel,
  isOpen,
  onDismiss,
  onTriggerClick,
  triggerClassName,
  popoverExtraClassName,
  triggerDisplay,
  children,
}: CalendarPickerPopoverProps) {
  useFloatingLayer({
    open: isOpen,
    layerRootRef: popoverRef,
    onEscape: onDismiss,
    lockScroll: false,
    trapTab: false,
    focusInitial: "none",
    restoreFocusMode: "target-if-inside",
    restoreLayerRef: popoverRef,
    restoreTargetRef: buttonRef,
  });

  // 열릴 때: 선택된 옵션이 있으면 그쪽, 없으면 첫 옵션으로 포커스
  useLayoutEffect(() => {
    if (!isOpen) return;
    const root = popoverRef.current;
    if (!root) return;
    const selected = root.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    const first = root.querySelector<HTMLElement>('[role="option"]');
    (selected ?? first)?.focus();
  }, [isOpen, popoverRef]);

  // 트리거·패널 밖을 누르면 닫기
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (buttonRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      onDismiss();
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onDismiss, buttonRef, popoverRef]);

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        type="button"
        ref={buttonRef}
        className={triggerClassName}
        onClick={onTriggerClick}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        aria-haspopup="listbox"
      >
        {triggerDisplay}
        <span
          className={clsx("month-calendar__title-caret", {
            "month-calendar__title-caret--open": isOpen,
          })}
          aria-hidden
        />
      </button>
      
      {/* 팝오버 패널 */}
      <div
        id={popoverId}
        ref={popoverRef}
        role="listbox"
        aria-label={listboxLabel}
        className={clsx("month-calendar__month-popover", popoverExtraClassName)}
        hidden={!isOpen}
      >
        {children}
      </div>
    </>
  );
}

type CalendarPopoverOptionProps = {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

// 월·연도 선택 옵션 (부모 listbox의 option)
export function CalendarPopoverOption({ selected, onSelect, children }: CalendarPopoverOptionProps) {
  return (
    <div
      role="option"
      tabIndex={0}
      aria-selected={selected}
      className={clsx("month-calendar__month-option", selected && "month-calendar__month-option--selected")}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {children}
    </div>
  );
}

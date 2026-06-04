import clsx from "clsx";
import { useEffect, useLayoutEffect } from "react";
import type { ReactNode, RefObject } from "react";
import { useFloatingLayer } from "@/hooks/useFloatingLayer";

type CalendarPickerPopoverProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  listboxLabel: string;
  isOpen: boolean;
  onDismiss: () => void;
  onTriggerClick: () => void;
  triggerClassName: string;
  popoverExtraClassName?: string;
  triggerDisplay: ReactNode;
  children: ReactNode;
};

// 연도·월 선택 팝오버
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

  // 열릴 때 선택된 옵션이 있으면 그쪽, 없으면 첫 옵션으로 포커스
  useLayoutEffect(() => {
    if (!isOpen) return;
    const root = popoverRef.current;
    if (!root) return;
    const selected = root.querySelector<HTMLElement>('[role="option"][aria-selected="true"]');
    const first = root.querySelector<HTMLElement>('[role="option"]');
    (selected ?? first)?.focus();
  }, [isOpen, popoverRef]);

  // 트리거·패널 밖을 누르면 팝오버 닫기
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

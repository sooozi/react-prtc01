import clsx from "clsx";
import type { ReactNode, RefObject } from "react";

type CalendarPickerPopoverProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  isOpen: boolean;
  onTriggerClick: () => void;
  triggerClassName: string;
  triggerAriaLabel: string;
  popoverAriaLabel: string;
  /** 연도 패널 등 추가 그리드/스크롤용 클래스 */
  popoverExtraClassName?: string;
  /** 트리거 안에 보여 줄 라벨(보통 aria-hidden 스팬 묶음) */
  triggerDisplay: ReactNode;
  children: ReactNode;
};

/**
 * 일정 달력 헤더의 연도·월 선택용: 트리거 버튼 + listbox 패널.
 * 닫기(ESC/바깥 클릭)는 부모가 ref로 판별하므로 여기서는 상태를 두지 않습니다.
 */
export function CalendarPickerPopover({
  buttonRef,
  popoverRef,
  popoverId,
  isOpen,
  onTriggerClick,
  triggerClassName,
  triggerAriaLabel,
  popoverAriaLabel,
  popoverExtraClassName,
  triggerDisplay,
  children,
}: CalendarPickerPopoverProps) {
  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={triggerClassName}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        aria-label={triggerAriaLabel}
        onClick={onTriggerClick}
      >
        {triggerDisplay}
        <span
          className={clsx("month-calendar__title-caret", {
            "month-calendar__title-caret--open": isOpen,
          })}
          aria-hidden
        />
      </button>
      <div
        id={popoverId}
        ref={popoverRef}
        className={clsx("month-calendar__month-popover", popoverExtraClassName)}
        role="listbox"
        aria-label={popoverAriaLabel}
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

export function CalendarPopoverOption({ selected, onSelect, children }: CalendarPopoverOptionProps) {
  return (
    <button
      type="button"
      className="month-calendar__month-option"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

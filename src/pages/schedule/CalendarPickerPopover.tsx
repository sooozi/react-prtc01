import clsx from "clsx";
import type { ReactNode, RefObject } from "react";

type CalendarPickerPopoverProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  isOpen: boolean;
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
  isOpen,
  onTriggerClick,
  triggerClassName,
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
        onClick={onTriggerClick}
      >
        {triggerDisplay}
        <span
          className={clsx("month-calendar__title-caret", {
            "month-calendar__title-caret--open": isOpen,
          })}
        />
      </button>
      <div
        id={popoverId}
        ref={popoverRef}
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

// 월 선택 옵션
export function CalendarPopoverOption({ selected, onSelect, children }: CalendarPopoverOptionProps) {
  return (
    <button
      type="button"
      className={clsx("month-calendar__month-option", selected && "month-calendar__month-option--selected")}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

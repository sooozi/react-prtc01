import { useId, useState } from "react";

export function SgPreviewTabs() {
  const baseId = useId();
  const [active, setActive] = useState<"all" | "notice" | "qna">("all");
  const tabs = [
    { id: "all" as const, label: "전체" },
    { id: "notice" as const, label: "공지" },
    { id: "qna" as const, label: "Q&A" },
  ];

  return (
    <div className="sg-tabs" role="tablist" aria-label="게시판 분류">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`${baseId}-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`${baseId}-panel`}
          className={active === tab.id ? "sg-tabs__tab is-active" : "sg-tabs__tab"}
          onClick={() => setActive(tab.id)}
        >
          {tab.label}
        </button>
      ))}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-${active}`}
        className="sg-tabs__panel"
      >
        {active === "all" && "전체 게시글 목록을 표시합니다."}
        {active === "notice" && "공지사항만 필터링합니다."}
        {active === "qna" && "Q&A 게시글만 표시합니다."}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

type SgSectionProps = {
  id: string;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SgSection({
  id,
  label,
  title,
  description,
  children,
  className,
}: SgSectionProps) {
  const sectionClass = ["sg-section", className].filter(Boolean).join(" ");

  return (
    <section id={id} className={sectionClass} aria-labelledby={`${id}-title`}>
      <header className="sg-section__head">
        <div className="sg-section__intro">
          <p className="sg-section__label">{label}</p>
          <h2 id={`${id}-title`} className="sg-section__title">
            {title}
          </h2>
        </div>
        {description ? <p className="sg-section__desc">{description}</p> : null}
      </header>
      <div className="sg-section__body">{children}</div>
    </section>
  );
}

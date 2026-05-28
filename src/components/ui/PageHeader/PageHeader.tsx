import type { ReactNode } from "react";
import clsx from "clsx";
import Badge from "@/components/ui/Badge/Badge";
import "./PageHeader.scss";

export type PageHeaderVariant = "list" | "centered" | "auth" | "inline";

export type PageHeaderProps = {
  badge: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
  /** 타이포는 동일. `centered`·`auth`·`inline`은 제목 아래 여백만 다름 */
  variant?: PageHeaderVariant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  as?: "header" | "div";
};

export default function PageHeader({
  badge,
  title,
  subtitle,
  titleId,
  variant = "list",
  className,
  titleClassName = "title",
  subtitleClassName = "subtitle",
  as: Tag = "header",
}: PageHeaderProps) {
  return (
    <Tag className={clsx("page-header", `page-header--${variant}`, className)}>
      <div className="page-header__block">
        <Badge>{badge}</Badge>
        <h1 id={titleId} className={titleClassName}>
          {title}
        </h1>
        {subtitle != null ? <p className={subtitleClassName}>{subtitle}</p> : null}
      </div>
    </Tag>
  );
}

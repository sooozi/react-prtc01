import type { ReactNode } from "react";
import clsx from "clsx";
import Badge from "@/components/Badge/Badge";
import "./PageHeader.scss";

export type PageHeaderVariant = "list" | "centered" | "auth" | "inline";

export type PageHeaderProps = {
  badge: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
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
  const content = (
    <>
      <Badge>{badge}</Badge>
      <h1 id={titleId} className={titleClassName}>
        {title}
      </h1>
      {subtitle != null ? <p className={subtitleClassName}>{subtitle}</p> : null}
    </>
  );

  if (variant === "list") {
    return (
      <Tag className={clsx("page-header page-header--list", className)}>
        <div className="page-header__block">{content}</div>
      </Tag>
    );
  }

  return (
    <Tag className={clsx("page-header", `page-header--${variant}`, className)}>
      {content}
    </Tag>
  );
}

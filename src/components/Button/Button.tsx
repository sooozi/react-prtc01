import { forwardRef } from "react";
import { Link } from "react-router-dom";
import "@/components/Button/Button.scss";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "primaryInverse"
  | "secondaryInverse"
  | "outlinePrimary"
  | "ghost";
export type ButtonSize = "sm" | "md";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: never;
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    to: string;
    href?: never;
    type?: never;
  };

type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
    to?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

function getClassNames(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  const list = ["btn", `btn--${variant}`, size === "sm" ? "btn--sm" : ""].filter(Boolean);
  if (className) list.push(className);
  return list.join(" ");
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, disabled, ...rest },
  ref
) {
  const classNames = getClassNames(variant, size, className);

  if ("to" in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest;
    return (
      <Link to={to} className={classNames} ref={ref as React.Ref<HTMLAnchorElement>} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest;
    return (
      <a
        href={href}
        className={classNames}
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-disabled={disabled}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const { type = "button", ...buttonRest } = rest as ButtonAsButton;
  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...buttonRest}
    >
      {children}
    </button>
  );
});

export default Button;

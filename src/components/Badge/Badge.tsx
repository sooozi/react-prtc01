import "@/components/Badge/Badge.scss";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ children, className }: BadgeProps) {
  return <span className={className ? `badge ${className}` : "badge"}>{children}</span>;
}

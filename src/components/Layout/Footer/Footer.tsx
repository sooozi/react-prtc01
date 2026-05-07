import "@/components/Layout/Footer/Footer.scss";

interface FooterProps {
  year?: number;
}

export default function Footer({
  year = new Date().getFullYear(),
}: FooterProps) {
  return (
    <footer className="footer">
      <p className="footer-text">
        © {year} MyViteProject. Built with React, TypeScript, and Vite.
      </p>
    </footer>
  );
}

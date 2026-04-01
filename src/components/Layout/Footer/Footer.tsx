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
        © {year} MyViteProject. Made with ❤️ using React & Vite
      </p>
    </footer>
  );
}

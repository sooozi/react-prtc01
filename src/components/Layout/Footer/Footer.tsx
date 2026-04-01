import "@/components/Layout/Footer/Footer.scss";

interface FooterProps {
  /** 저작권 연도 */
  year?: number;
  /** 프로젝트 이름 */
  projectName?: string;
}

/**
 * 공통 푸터 컴포넌트
 */
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

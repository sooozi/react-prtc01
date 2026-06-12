import { createRoot } from "react-dom/client";
import "@/styles/reset.scss";
import "@/styles/common-global.scss";
import "quill/dist/quill.snow.css";
import App from "@/App";

// 저장된 테마를 적용 (다크 모드 플래시 방지)
const savedTheme = localStorage.getItem("theme");
const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
document.documentElement.setAttribute("data-theme", theme);

const rootEl = document.getElementById("root")!;

createRoot(rootEl).render(<App />);

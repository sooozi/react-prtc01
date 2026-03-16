import { createRoot } from 'react-dom/client'
import "@/index.css";
import App from "@/App";

// 저장된 테마를 적용 (다크 모드 플래시 방지)
const savedTheme = localStorage.getItem("theme");
const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
document.documentElement.setAttribute("data-theme", theme);

createRoot(document.getElementById('root')!).render(
    <App />
)

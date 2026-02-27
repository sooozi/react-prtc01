import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/about/About";
import UserSearch from "@/pages/user/Search";
import Board from "@/pages/user/Board";
import MyPage from "@/pages/user/MyPage";
import Forbidden from "@/pages/Forbidden";
import Login from "@/pages/auth/login/Login";
import Signup from "@/pages/auth/signup/Signup";
import { Layout } from "@/components";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트 경로 → /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 모든 페이지에 Layout(Header, Footer) 적용 */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/user/search" element={<UserSearch />} />
          <Route path="/user/board" element={<Board />} />
          <Route path="/user/mypage" element={<MyPage />} />
          <Route path="/forbidden" element={<Forbidden />} />
        </Route>

        {/* 잘못된 URL은 forbidden으로 */}
        <Route path="*" element={<Navigate to="/forbidden" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
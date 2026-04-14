import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/about/About";
import UserList from "@/pages/user/List";
import UserDetail from "@/pages/user/Detail";
import List from "@/pages/post/List";
import Detail from "@/pages/post/Detail";
import Write from "@/pages/post/Write";
import Update from "@/pages/post/Update";
import MyPage from "@/pages/user/MyPage";
import Forbidden from "@/pages/Forbidden";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/login/Login";
import Signup from "@/pages/auth/signup/Signup";
import { Layout } from "@/components";
import RequireAuth from "@/router/RequireAuth";

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
          {/* 사용자 목록·상세: 목 데이터만 사용, 로그인 없이 접근 가능 */}
          <Route path="/user/list" element={<UserList />} />
          <Route path="/user/detail" element={<UserDetail />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* 로그인 필요 — 토큰 없으면 RequireAuth에서 /auth/login 으로 이동 */}
          <Route element={<RequireAuth />}>
            <Route path="/post/list" element={<List />} />
            <Route path="/post/detail" element={<Detail />} />
            <Route path="/post/update" element={<Update />} />
            <Route path="/post/write" element={<Write />} />
            <Route path="/user/mypage" element={<MyPage />} />
          </Route>
        </Route>

        {/* 정의되지 않은 경로 → 404 페이지 */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
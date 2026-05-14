import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "@/pages/Home";
import About from "@/pages/about/About";
import UserList from "@/pages/user/list/List";
import UserDetail from "@/pages/user/detail/Detail";
import List from "@/pages/post/List";
import Detail from "@/pages/post/Detail";
import Write from "@/pages/post/Write";
import Update from "@/pages/post/Update";
import MyPage from "@/pages/user/my-page/MyPage";
import Schedule from "@/pages/schedule/Schedule";
import Forbidden from "@/pages/errors/Forbidden";
import NotFound from "@/pages/errors/NotFound";
import Login from "@/pages/auth/login/Login";
import Signup from "@/pages/auth/signup/Signup";
import { Layout } from "@/components";
import RequireAuth from "@/router/RequireAuth";
import RouteHeadSync from "@/router/RouteHeadSync";

export default function AppRouter() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <RouteHeadSync />
        <Routes>
          {/* Layout 밖에서 Navigate만 쓰면 그 순간 <main>이 없어 axe가 경고함 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
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
              <Route path="/schedule" element={<Schedule />} />
            </Route>

            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
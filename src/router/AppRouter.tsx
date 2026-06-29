import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "@/pages/home/Home";
import TestMain from "@/pages/testmain/TestMain";
import About from "@/pages/about/About";
import StyleGuide from "@/pages/style-guide/StyleGuide";
import UserList from "@/pages/user/list/List";
import UserDetail from "@/pages/user/detail/Detail";
import MyPage from "@/pages/user/my-page/MyPage";
import Forbidden from "@/pages/errors/forbidden/Forbidden";
import NotFound from "@/pages/errors/not-found/NotFound";
import Login from "@/pages/auth/login/Login";
import Signup from "@/pages/auth/signup/Signup";
import { Layout } from "@/components";
import RequireAuth from "@/router/RequireAuth";
import RouteHeadSync from "@/router/RouteHeadSync";
import LazyRoute from "@/router/LazyRoute";

/** 무거운 페이지·Quill 등 — 방문 시점에 청크 로드 */
const PostList = lazy(() => import("@/pages/post/list/List"));
const PostDetail = lazy(() => import("@/pages/post/detail/Detail"));
const PostWrite = lazy(() => import("@/pages/post/write/Write"));
const PostUpdate = lazy(() => import("@/pages/post/update/Update"));
const Schedule = lazy(() => import("@/pages/schedule/Schedule"));

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
            <Route path="/testmain" element={<TestMain />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            {/* 사용자 목록·상세: 목 데이터만 사용, 로그인 없이 접근 가능 */}
            <Route path="/user/list" element={<UserList />} />
            <Route path="/user/detail" element={<UserDetail />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/not-found" element={<NotFound />} />

            {/* 로그인 필요 — 토큰 없으면 RequireAuth에서 /auth/login 으로 이동 */}
            <Route element={<RequireAuth />}>
              <Route
                path="/post/list"
                element={
                  <LazyRoute fallback="post-list">
                    <PostList />
                  </LazyRoute>
                }
              />
              <Route
                path="/post/detail"
                element={
                  <LazyRoute fallback="post-detail">
                    <PostDetail />
                  </LazyRoute>
                }
              />
              <Route
                path="/post/update"
                element={
                  <LazyRoute fallback="rich-text">
                    <PostUpdate />
                  </LazyRoute>
                }
              />
              <Route
                path="/post/write"
                element={
                  <LazyRoute fallback="rich-text">
                    <PostWrite />
                  </LazyRoute>
                }
              />
              <Route path="/user/mypage" element={<MyPage />} />
              <Route
                path="/schedule"
                element={
                  <LazyRoute fallback="schedule">
                    <Schedule />
                  </LazyRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

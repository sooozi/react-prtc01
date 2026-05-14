import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getRouteDocumentMeta } from "@/router/routeDocumentMeta";

/**
 * 경로에 따라 document title 갱신 + 라우트 변경 시 스크린 리더용 짧은 안내(aria-live polite).
 * 첫 마운트에서는 live만 비워 두어, 초기 로드 시 중복 안내를 줄입니다.
 */
export default function RouteHeadSync() {
  const { pathname, search } = useLocation();
  const meta = getRouteDocumentMeta(pathname);
  const [liveMessage, setLiveMessage] = useState("");
  const skipAnnounceRef = useRef(true);

  useEffect(() => {
    if (skipAnnounceRef.current) {
      skipAnnounceRef.current = false;
      return;
    }
    const text = getRouteDocumentMeta(pathname).announce;
    queueMicrotask(() => {
      setLiveMessage(text);
    });
  }, [pathname, search]);

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
      </Helmet>
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {liveMessage}
      </div>
    </>
  );
}

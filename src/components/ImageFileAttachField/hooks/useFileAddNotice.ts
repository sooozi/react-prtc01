import { useCallback, useEffect, useRef, useState } from "react";

const FILE_ADD_NOTICE_CLEAR_MS = 9000;

export function useFileAddNotice() {
  const [message, setMessage] = useState("");
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = useCallback((parts: string[]) => {
    if (parts.length === 0) return;

    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }

    setMessage(parts.join(" "));
    clearTimeoutRef.current = setTimeout(() => {
      setMessage("");
      clearTimeoutRef.current = null;
    }, FILE_ADD_NOTICE_CLEAR_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  return { message, showNotice };
}

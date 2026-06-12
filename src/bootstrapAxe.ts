import * as React from "react";
import * as ReactDOM from "react-dom";
import reactAxe from "@axe-core/react";

/** 라우트·lazy 로딩 직후 DOM이 안정될 때까지 debounce (ms) */
const AXE_DEBOUNCE_MS = 2000;

let started = false;

/** 개발 전용: 콘솔에 axe 위반 로그 (@axe-core/react README상 React 18+는 공식 비지원이나 로컬 점검용) */
export function bootstrapAxe(): Promise<void> {
  if (started) return Promise.resolve();
  started = true;
  return reactAxe(React, ReactDOM, AXE_DEBOUNCE_MS);
}

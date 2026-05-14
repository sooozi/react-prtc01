import * as React from "react";
import * as ReactDOM from "react-dom";
import reactAxe from "@axe-core/react";

/** 개발 전용: 콘솔에 axe 위반 로그 (@axe-core/react README상 React 18+는 공식 비지원이나 로컬 점검용) */
export function bootstrapAxe(): Promise<void> {
  return reactAxe(React, ReactDOM, 1000);
}

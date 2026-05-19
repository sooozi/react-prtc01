import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorFallback from "@/components/ErrorBoundary/ErrorFallback";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** 경로가 바뀌면 에러 상태를 자동으로 초기화 (Layout Outlet용) */
  resetKey?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * 자식 트리의 렌더링 오류를 잡아 폴백 UI를 표시합니다.
 * (API 오류·이벤트 핸들러 오류는 try/catch 등으로 별도 처리)
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKey } = this.props;
    if (resetKey !== prevProps.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return <ErrorFallback error={error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

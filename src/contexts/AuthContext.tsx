import { createContext, useContext, useState, type ReactNode } from "react";

// 인증 컨텍스트 타입
export type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  userName: string | null;
  setUserName: (userName: string | null) => void;
};

// 인증 컨텍스트 생성 (토큰/setToken을 넣어 둘 Context 통로 제작)
const AuthContext = createContext<AuthContextType | null>(null);

// 인증 컨텍스트 제공자 (토큰 상태를 만들고, 그걸 아래 컴포넌트들에게 넘겨주는 Provider)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [userName, setUserName] = useState<string | null>(() =>
    localStorage.getItem("userName")
  );

  return (
    <AuthContext.Provider value={{ token, setToken, userName, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

// 인증 컨텍스트 사용 (Context + 훅을 한 파일에 두기 위해 규칙 비활성화)
// AuthProvider가 전달한 { token, setToken }을 꺼내서 반환해주는 함수
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

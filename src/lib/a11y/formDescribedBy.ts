// 필드 `aria-describedby`용 id 목록을 공백으로 이어 반환
export function formDescribedBy(...ids: (string | false | null | undefined)[]): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

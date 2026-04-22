/**
 * 바이트 수를 읽기 쉬운 문자열로 변환한다.
 *
 * 요약: B(가장 작은 단위) → KB·MB·GB는 각각 1024배씩 묶은 단위다. 작은 파일을 MB만 쓰면
 * `0.006 MB`처럼 소수가 길어지고, 큰 파일을 KB만 쓰면 숫자가 너무 커진다. 그래서
 * **1 MiB(1024×1024 바이트, ≈1MB) 미만은 KB**, 그 이상은 **MB**, 더 크면 **GB**로
 * 표기해 짧고 읽기 쉽게 맞춘다.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes === 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    if (kb >= 100) {
      return `${Math.round(kb)} KB`;
    }
    return `${Number(kb.toFixed(1))} KB`;
  }
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    const decimals = mb < 10 ? 2 : mb < 100 ? 1 : 0;
    return `${Number(mb.toFixed(decimals))} MB`;
  }
  const gb = mb / 1024;
  const gbDecimals = gb < 10 ? 2 : 1;
  return `${Number(gb.toFixed(gbDecimals))} GB`;
}

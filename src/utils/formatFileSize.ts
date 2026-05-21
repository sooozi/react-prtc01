const SIZE_LOCALE = "ko-KR";

// 숫자를 천 단위 콤마를 붙인 문자열로 변환
function formatSizeAmount(value: number, maximumFractionDigits: number): string {
  return value.toLocaleString(SIZE_LOCALE, {
    minimumFractionDigits: 0, // 소수점 이하 자릿수
    maximumFractionDigits, // 소수점 이하 최대 자릿수
  });
}

/**
 * 바이트 수를 읽기 쉬운 문자열로 변환!
 *
 * 요약: B(가장 작은 단위) → KB·MB·GB는 각각 1024배씩 묶은 단위다
 * 작은 파일을 MB만 쓰면 `0.006 MB`처럼 소수가 길어지고, 큰 파일을 KB만 쓰면 숫자가 너무 커진다
 * 그래서 1 MB(1024×1024 바이트) 미만은 KB, 더 크면 GB로 표기한다
 * 숫자는 ko-KR 천 단위 콤마를 붙인다
 */

export function formatFileSize(bytes: number): string {
  // 숫자가 아니거나 음수인 경우
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  // 0바이트인 경우
  if (bytes === 0) {
    return "0 B";
  }
  // 바이트: 1024바이트 미만인 경우
  if (bytes < 1024) {
    return `${formatSizeAmount(bytes, 0)} B`;
  }
  // 킬로바이트: 1024바이트 이상 1024 * 1024바이트 미만인 경우
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    if (kb >= 100) {
      return `${formatSizeAmount(Math.round(kb), 0)} KB`;
    }
    return `${formatSizeAmount(kb, 1)} KB`;
  }
  // 메가바이트: 1024 * 1024바이트 이상 1024 * 1024 * 1024바이트 미만인 경우
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    const decimals = mb < 10 ? 2 : mb < 100 ? 1 : 0;
    return `${formatSizeAmount(mb, decimals)} MB`;
  }
  // 기가바이트: 1024 * 1024 * 1024바이트 이상인 경우
  const gb = mb / 1024;
  const gbDecimals = gb < 10 ? 2 : 1;
  return `${formatSizeAmount(gb, gbDecimals)} GB`;
}

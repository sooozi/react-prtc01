/**
 * [from, to) 구간이 아니라, from 인덱스 항목을 to 인덱스 위치에 끼워 넣는 이동.
 */
export function arrayMove<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
    return list;
  }
  if (fromIndex === toIndex) {
    return list;
  }
  const next = list.slice();
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}

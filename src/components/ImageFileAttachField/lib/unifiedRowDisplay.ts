import { formatFileSize } from "@/utils/formatFileSize";
import type { ImageAttachRowDisplay } from "../hooks/useImageAttachReorder";
import type { ImageFileUnifiedRow } from "../types";

export function getUnifiedRowDisplay(row: ImageFileUnifiedRow): ImageAttachRowDisplay {
  if (row.kind === "server") {
    return {
      fileName: row.name,
      sizeLabel: row.sizeBytes != null ? formatFileSize(row.sizeBytes) : "?",
    };
  }

  return {
    fileName: row.file.name,
    sizeLabel: formatFileSize(row.file.size),
  };
}

export function getUnifiedRowKey(row: ImageFileUnifiedRow): string {
  return row.kind === "server" ? `srv-${row.fileId}` : row.id;
}

export function sumUnifiedRowsSizeBytes(rows: readonly ImageFileUnifiedRow[]): number {
  return rows.reduce((sum, r) => {
    if (r.kind === "local") return sum + r.file.size;
    return sum + (r.sizeBytes ?? 0);
  }, 0);
}

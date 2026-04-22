import type { FileWithId } from "./ImageFileAttachField.types";

export function filesToItemsWithIds(files: File[]): FileWithId[] {
  return files.map((file) => ({ id: crypto.randomUUID(), file }));
}

export function itemsToFiles(items: FileWithId[]): File[] {
  return items.map((i) => i.file);
}

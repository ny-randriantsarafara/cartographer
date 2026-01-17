import type { CursorPaginationParams } from "../../domain/object-values/index.js";

export function encodeCursor(osmId: string): string {
  return Buffer.from(osmId).toString("base64");
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

export function buildCursorResponse<T extends { osmId: string }>(
  items: T[],
  limit: number
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  const hasMore = items.length > limit;
  const pageItems = hasMore ? items.slice(0, limit) : items;
  const lastItem = pageItems[pageItems.length - 1];
  const nextCursor = hasMore && lastItem ? encodeCursor(lastItem.osmId) : null;

  return {
    items: pageItems,
    nextCursor,
    hasMore,
  };
}

export function getCursorOsmId(params: CursorPaginationParams): string | undefined {
  return params.cursor ? decodeCursor(params.cursor) : undefined;
}

import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor, buildCursorResponse, getCursorOsmId } from '../cursor-pagination';

describe('cursor-pagination', () => {
  describe('encodeCursor', () => {
    it('should encode osmId to base64', () => {
      const osmId = 'node/123456';
      const encoded = encodeCursor(osmId);

      expect(encoded).toBe(Buffer.from(osmId).toString('base64'));
    });

    it('should handle special characters', () => {
      const osmId = 'way/123-456_789';
      const encoded = encodeCursor(osmId);

      expect(decodeCursor(encoded)).toBe(osmId);
    });
  });

  describe('decodeCursor', () => {
    it('should decode base64 cursor back to osmId', () => {
      const osmId = 'node/123456';
      const cursor = Buffer.from(osmId).toString('base64');

      expect(decodeCursor(cursor)).toBe(osmId);
    });

    it('should be inverse of encodeCursor', () => {
      const osmId = 'relation/999999';

      expect(decodeCursor(encodeCursor(osmId))).toBe(osmId);
    });
  });

  describe('getCursorOsmId', () => {
    it('should return undefined when no cursor provided', () => {
      const result = getCursorOsmId({ limit: 10 });

      expect(result).toBeUndefined();
    });

    it('should decode cursor when provided', () => {
      const osmId = 'node/12345';
      const cursor = encodeCursor(osmId);

      const result = getCursorOsmId({ cursor, limit: 10 });

      expect(result).toBe(osmId);
    });
  });

  describe('buildCursorResponse', () => {
    it('should return all items when count equals limit', () => {
      const items = [{ osmId: '1' }, { osmId: '2' }, { osmId: '3' }];

      const result = buildCursorResponse(items, 3);

      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should return all items when count is less than limit', () => {
      const items = [{ osmId: '1' }, { osmId: '2' }];

      const result = buildCursorResponse(items, 5);

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should truncate and set hasMore when items exceed limit', () => {
      const items = [{ osmId: '1' }, { osmId: '2' }, { osmId: '3' }, { osmId: '4' }];

      const result = buildCursorResponse(items, 3);

      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe(encodeCursor('3'));
    });

    it('should handle empty array', () => {
      const result = buildCursorResponse([], 10);

      expect(result.items).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should use last item osmId for cursor', () => {
      const items = [{ osmId: 'first' }, { osmId: 'middle' }, { osmId: 'last' }, { osmId: 'extra' }];

      const result = buildCursorResponse(items, 3);

      expect(decodeCursor(result.nextCursor!)).toBe('last');
    });
  });
});

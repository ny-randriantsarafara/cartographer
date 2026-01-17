import type { CursorPage, CursorPaginationParams, Point } from "../../domain/index.js";
import type { Zone, ZoneRepository } from "../../domain/index.js";

export interface ListZonesQuery extends CursorPaginationParams {
  type?: string;
  containing?: Point;
}

export class ListZonesUseCase {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  async execute(query: ListZonesQuery): Promise<CursorPage<Zone> | Zone[]> {
    const { type, containing, ...paginationParams } = query;

    if (containing) {
      return this.zoneRepository.findContaining(containing);
    }

    if (type) {
      return this.zoneRepository.findByType(type, paginationParams);
    }

    return this.zoneRepository.findAll(paginationParams);
  }
}

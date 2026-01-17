import type { Poi, PoiRepository, CursorPage, CursorPaginationParams, Point, RadiusQuery } from '../../../domain';

export interface ListPoisQuery extends CursorPaginationParams {
  category?: string;
  near?: Point;
  radius?: RadiusQuery;
  zoneId?: string;
}

export class ListPoisUseCase {
  constructor(private readonly poiRepository: PoiRepository) {}

  async execute(query: ListPoisQuery): Promise<CursorPage<Poi>> {
    const { category, near, radius, zoneId, ...paginationParams } = query;

    if (zoneId) {
      return this.poiRepository.findInZone(zoneId, paginationParams);
    }

    if (radius) {
      return this.poiRepository.findInRadius(radius, paginationParams);
    }

    if (near) {
      return this.poiRepository.findNear(near, paginationParams);
    }

    if (category) {
      return this.poiRepository.findByCategory(category, paginationParams);
    }

    return this.poiRepository.findAll(paginationParams);
  }
}

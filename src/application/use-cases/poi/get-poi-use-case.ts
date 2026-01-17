import type { Poi, PoiRepository } from '../../../domain';

export class GetPoiUseCase {
  constructor(private readonly poiRepository: PoiRepository) {}

  async execute(osmId: string): Promise<Poi | null> {
    return this.poiRepository.findById(osmId);
  }
}

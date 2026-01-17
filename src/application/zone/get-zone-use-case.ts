import type { Zone, ZoneRepository } from "../../domain/zone/index.js";

export class GetZoneUseCase {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  async execute(osmId: string): Promise<Zone | null> {
    return this.zoneRepository.findById(osmId);
  }
}

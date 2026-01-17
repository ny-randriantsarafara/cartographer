import type { Kysely } from "kysely";
import type { PoiRepository, ZoneRepository } from "../domain/index.js";
import { GetPoiUseCase, ListPoisUseCase, GetZoneUseCase, ListZonesUseCase } from "../application/index.js";
import { KyselyPoiRepository, KyselyZoneRepository, type DB } from "./persistence/index.js";

export interface Repositories {
  poi: PoiRepository;
  zone: ZoneRepository;
}

export interface UseCases {
  getPoi: GetPoiUseCase;
  listPois: ListPoisUseCase;
  getZone: GetZoneUseCase;
  listZones: ListZonesUseCase;
}

export interface Container {
  repositories: Repositories;
  useCases: UseCases;
  resolve<T>(key: string): T;
}

/**
 * Dynamic Dependency Injection Container
 * Provides centralized dependency management with lazy initialization
 */
export function createContainer(db: Kysely<DB>): Container {
  const instances = new Map<string, unknown>();

  // Repository factory functions
  const repositoryFactories = {
    poi: () => new KyselyPoiRepository(db),
    zone: () => new KyselyZoneRepository(db),
  };

  // Use case factory functions
  const useCaseFactories = {
    getPoi: () => new GetPoiUseCase(repositories.poi),
    listPois: () => new ListPoisUseCase(repositories.poi),
    getZone: () => new GetZoneUseCase(repositories.zone),
    listZones: () => new ListZonesUseCase(repositories.zone),
  };

  // Lazy initialization of repositories
  const repositories: Repositories = new Proxy({} as Repositories, {
    get(_, prop: string) {
      const key = `repository:${prop}`;
      if (!instances.has(key)) {
        const factory = repositoryFactories[prop as keyof typeof repositoryFactories];
        if (!factory) {
          throw new Error(`Repository '${prop}' not found`);
        }
        instances.set(key, factory());
      }
      return instances.get(key);
    },
  });

  // Lazy initialization of use cases
  const useCases: UseCases = new Proxy({} as UseCases, {
    get(_, prop: string) {
      const key = `useCase:${prop}`;
      if (!instances.has(key)) {
        const factory = useCaseFactories[prop as keyof typeof useCaseFactories];
        if (!factory) {
          throw new Error(`Use case '${prop}' not found`);
        }
        instances.set(key, factory());
      }
      return instances.get(key);
    },
  });

  // Generic resolver for testing/extension purposes
  const resolve = <T>(key: string): T => {
    if (!instances.has(key)) {
      throw new Error(`Dependency '${key}' not found in container`);
    }
    return instances.get(key) as T;
  };

  return { repositories, useCases, resolve };
}

import { seededData } from "@wallet-ledger/seed";

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

/**
 * ItemsService - Dynamic catalog item management
 *
 * Loads catalog from the seed package which fetches from external API.
 * Items are stored in a Map for O(1) lookup by ID.
 *
 * In production, this could be backed by:
 * - Database with periodic refresh
 * - Redis cache with TTL
 * - Background CRON job updating prices
 *
 * The seed data is generated via `pnpm gen` in packages/seed,
 * which fetches products from dummyjson.com API and transforms them
 * with UUIDs and prices in cents.
 */
export class ItemsService {
  protected readonly catalogMap: Map<string, CatalogItem>;
  protected readonly catalogItems: CatalogItem[];

  constructor() {
    // Load from dynamically generated seed data
    this.catalogItems = seededData.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price
    }));

    this.catalogMap = new Map(
      this.catalogItems.map(item => [item.id, item])
    );
  }

  /**
   * Returns all catalog items
   */
  public getAll(): CatalogItem[] {
    return this.catalogItems;
  }

  /**
   * Returns a catalog item by ID, or undefined if not found
   */
  public getById(id: string): CatalogItem | undefined {
    return this.catalogMap.get(id);
  }

  /**
   * Checks if an item exists in the catalog
   */
  public exists(id: string): boolean {
    return this.catalogMap.has(id);
  }

  /**
   * Returns items within a price range (inclusive)
   */
  public getByPriceRange(minPrice: number, maxPrice: number): CatalogItem[] {
    return this.catalogItems.filter(
      item => item.price >= minPrice && item.price <= maxPrice
    );
  }

  /**
   * Returns the count of items in the catalog
   */
  public count(): number {
    return this.catalogItems.length;
  }
}

// Re-export seeded data for backward compatibility
export const CATALOG_ITEMS: CatalogItem[] = seededData;

export function getAllItems(): CatalogItem[] {
  return seededData;
}

export function getItemById(id: string): CatalogItem | undefined {
  return seededData.find(item => item.id === id);
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
}

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "33456444-29af-4484-b5d1-af61d06ef889",
    name: "iPhone 13 Pro",
    price: 109999
  },
  {
    id: "b8c887ee-d5c6-4815-98fe-7dd102b80d73",
    name: "iPhone X",
    price: 89999
  },
  {
    id: "f71bc01c-b3c2-464c-a54c-a857100ef171",
    name: "Apple AirPods Max Silver",
    price: 54999
  },
  {
    id: "372d8cd7-2c2b-4d7f-b366-5af2d63509f8",
    name: "Apple Watch Series 4 Gold",
    price: 34999
  }
];

const CATALOG_MAP = new Map(CATALOG_ITEMS.map((item) => [item.id, item]));

export function getAllItems(): CatalogItem[] {
  return CATALOG_ITEMS;
}

export function getItemById(id: string): CatalogItem | undefined {
  return CATALOG_MAP.get(id);
}

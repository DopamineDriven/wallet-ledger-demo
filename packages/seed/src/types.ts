import type { Rm } from "@wallet-ledger/types";

export type ProductPath = `products`;
export type ProductCats<T extends CategoryUnion | undefined = undefined> =
  T extends undefined
    ? `${ProductPath}/categories`
    : T extends CategoryUnion
      ? `${ProductPath}/category/${T}`
      : never;

export type AllProductPaths =
  | ProductCats<CategoryUnion>
  | "products/categories"
  | "products/category-list"
  | "products";

export type SortByUnion =
  | "title"
  | "price"
  | "rating"
  | "sku"
  | "discountPercentage"
  | "category"
  | "id"
  | "brand"
  | "stock"
  | "weight"
  | "availabilityStatus"
  | "minimumOrderQuantity";

export type SelectUnion =
  | SortByUnion
  | "thumbnail"
  | "images"
  | "returnPolicy"
  | "reviews"
  | "shippingInformation"
  | "warrantyInformation"
  | "tags"
  | "dimensions"
  | "description"
  | "meta";

export interface ExpandedSeeder<M extends boolean = boolean> {
  id: M extends false ? number : string;
  title: string;
  price: number;
  name: string;
  description?: string;
}

export interface DataApiOpts<T extends keyof ProductDataFull> {
  limit?: number;
  skip?: number;
  select?: readonly T[] | readonly [T];
  sortBy?: SortByUnion;
  order?: "asc" | "desc";
}

export type ItemSeederSingleton<
  M extends boolean = boolean,
  V extends "title" | "name" = "title"
> = V extends "name"
  ? Rm<ExpandedSeeder<M>, "title">
  : Rm<ExpandedSeeder<M>, "name">;
export interface ItemSeederProductsEntity<
  M extends boolean = boolean,
  V extends "title" | "name" = "title"
> {
  products: ItemSeederSingleton<M, V>[];
}

export interface ItemSeederEntity<
  M extends boolean = boolean,
  V extends "title" | "name" = "title"
> extends ItemSeederProductsEntity<M, V> {
  total: number;
  skip: number;
  limit: number;
}
export interface ProductMetaFields {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface ProductDims {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReviewsSingleton {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDataFull {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  sku: string;
  weight: number;
  dimensions: ProductDims;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReviewsSingleton[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMetaFields;
  /**
   * always webp
   */
  images: string[];
  thumbnail: string;
  brand?: string | undefined;
}

export type FilterBySelect<Q extends keyof ProductDataFull> = Exclude<
  Exclude<Q, ProductDataFull>,
  ProductDataFull
>;

export type FilterResults<S extends keyof ProductDataFull> = Rm<
  ProductDataFull,
  Exclude<keyof ProductDataFull, FilterBySelect<S>>
>;

export interface FullRes<
  S extends keyof ProductDataFull = keyof ProductDataFull
> {
  products: FilterResults<S>[];
  total: number;
  skip: number;
  limit: number;
}
export type CategoryUnion =
  | "beauty"
  | "fragrances"
  | "furniture"
  | "groceries"
  | "home-decoration"
  | "kitchen-accessories"
  | "laptops"
  | "mens-shirts"
  | "mens-shoes"
  | "mens-watches"
  | "mobile-accessories"
  | "motorcycle"
  | "skin-care"
  | "smartphones"
  | "sports-accessories"
  | "sunglasses"
  | "tablets"
  | "tops"
  | "vehicle"
  | "womens-bags"
  | "womens-dresses"
  | "womens-jewellery"
  | "womens-shoes"
  | "womens-watches";

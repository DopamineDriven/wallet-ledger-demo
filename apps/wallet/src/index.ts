export { ItemSeeder, dataGenFactory } from "@/data/seed.ts";
export type {
  AllProductPaths,
  CategoryUnion,
  DataApiOpts,
  ExpandedSeeder,
  FilterBySelect,
  FilterResults,
  FullRes,
  ItemSeederEntity,
  ItemSeederProductsEntity,
  ItemSeederSingleton,
  ProductCats,
  ProductDataFull,
  ProductDims,
  ProductMetaFields,
  ProductPath,
  ProductReviewsSingleton,
  SelectUnion,
  SortByUnion
} from "@/data/types.ts";

export {dummyData} from "@/items/gen/items-data.ts";


declare module "http" {
  interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
    "x-idempotency-key"?: string;
    "x-user-id"?: string;
  }
}

declare global {
  interface JSON {
    parse<T = unknown>(
      text: string,
      reviver?: (this: any, key: string, value: any) => any
    ): T;
  }
  interface Body {
    json<T = unknown>(): Promise<T>;
  }
  interface Response {
    json<T = unknown>(): Promise<T>;
  }
  interface ObjectConstructor {
    // PropertyKey -> string and number allowed, symbol disallowed (symbol can't be enumerable)
    keys<T = object>(
      o: T
    ): (keyof T extends infer K
      ? K extends string
        ? K
        : K extends number
          ? `${K}`
          : never
      : never)[];
    entries<T = object, V extends keyof T = keyof T>(
      o: T
    ): (V extends infer K
      ? K extends string
        ? [K, T[V]]
        : K extends number
          ? [`${K}`, T[V]]
          : never
      : never)[];
  }
}

import { randomUUID } from "node:crypto";
import type {
  AllProductPaths,
  DataApiOpts,
  FullRes,
  ProductDataFull,
  SelectUnion
} from "@/types.ts";
import { Fs } from "@d0paminedriven/fs";
import type { CTR, Unenumerate } from "@wallet-ledger/types";

export class ItemSeeder<B extends keyof ProductDataFull> extends Fs {
  constructor() {
    super(process.cwd());
  }
  protected safeErrMsg(err: unknown) {
    if (err instanceof Error) {
      return err.message;
    } else if (typeof err === "object" && err != null) {
      return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
    } else if (typeof err === "string") {
      return err;
    } else if (typeof err === "number") {
      return err.toPrecision(5);
    } else if (typeof err === "boolean") {
      return `${err}`;
    } else return String(err);
  }
  public async nodeUUID<const C extends number = 20>(count = 20 as C) {
    if (count <= 0) {
      throw new Error("UUID Target count must be a postive number");
    }
    const agg = Array.of<string>();
    for (const _i of this.len(Math.round(count))) {
      agg.push(randomUUID());
    }
    // const toJSON = JSON.stringify(agg, null, 2);
    // const templatize = `export const aggItemUUIDs = ${toJSON};`;
    // this.withWs(`src/items/gen/ids.ts`, templatize);

    return agg;
  }

  private handleQp<
    const M extends string[] = string[],
    const U extends string = string
  >(s: M, url: U) {
    if (s.length > 0) {
      return url.concat(`?`).concat(s.join("&"));
    } else {
      return url;
    }
  }

  private handleSelect<
    const V extends keyof ProductDataFull = keyof ProductDataFull
  >({ limit, order, select, skip, sortBy }: DataApiOpts<V>) {
    const a = Array.of<readonly [string, string | number | boolean]>();

    if (select && select.length > 0) {
      const k = select.join(",");
      const tuple = ["select", k] as const;
      a.push(tuple);
    }
    if (skip && skip > 0) {
      a.push(["skip", 0]);
    }
    if (order) {
      a.push(["order", order]);
    }
    if (limit) {
      if (limit <= 0) {
        a.push(["limit", 1]);
      } else {
        a.push(["limit", limit]);
      }
    }
    if (sortBy) {
      a.push(["sortBy", sortBy]);
    }

    return { arr: a, selectFilter: select };
  }

  public async reusableFetch<const S extends keyof ProductDataFull>(
    path: AllProductPaths,
    qParams: CTR<DataApiOpts<S>, "select">
  ): Promise<FullRes<S>>;
  public async reusableFetch(
    path: AllProductPaths,
    qParams: DataApiOpts<keyof ProductDataFull>
  ): Promise<FullRes<keyof ProductDataFull>>;
  public async reusableFetch<
    const A extends AllProductPaths = AllProductPaths,
    const S extends keyof ProductDataFull = keyof ProductDataFull
  >(path: A, queryParams: DataApiOpts<S>) {
    const qParams = this.handleSelect(queryParams);

    console.log("debig", qParams);
    const s = qParams.selectFilter;
    const arr = Array.of<string>();
    if (qParams.arr && qParams.arr.length > 0) {
      for (const [_, v] of qParams.arr.entries()) {
        const format = [v[0], `${v[1]}`.trim()] as const;
        arr.push(format.join("="));
      } 
    }
    const urlPrimed = this.handleQp(arr, `https://dummyjson.com/${path}`);
    console.log(urlPrimed);
    return await fetch(urlPrimed, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(async t => {
      if (s) {
        return await t.json<FullRes<Unenumerate<typeof s>>>();
      } else {
        return await t.json<FullRes<keyof ProductDataFull>>();
      }
    });
  }
  private IdMap = new Map<number, string>();
  private len<const R extends number = number>(r = 20 as R) {
    return Array.from({ length: r });
  }

  public validProductPath(s: string) {
    return (
      s === "products" ||
      s === "products/categories" ||
      s === "products/category/beauty" ||
      s === "products/category/fragrances" ||
      s === "products/category/furniture" ||
      s === "products/category/groceries" ||
      s === "products/category/home-decoration" ||
      s === "products/category/kitchen-accessories" ||
      s === "products/category/laptops" ||
      s === "products/category/mens-shirts" ||
      s === "products/category/mens-shoes" ||
      s === "products/category/mens-watches" ||
      s === "products/category/mobile-accessories" ||
      s === "products/category/motorcycle" ||
      s === "products/category/skin-care" ||
      s === "products/category/smartphones" ||
      s === "products/category/sports-accessories" ||
      s === "products/category/sports-accessories" ||
      s === "products/category/sunglasses" ||
      s === "products/category/tablets" ||
      s === "products/category/tops" ||
      s === "products/category/vehicle" ||
      s === "products/category/womens-bags" ||
      s === "products/category/womens-dresses" ||
      s === "products/category/womens-jewellery" ||
      s === "products/category/womens-shoes" ||
      s === "products/category/womens-watches" ||
      s === "products/category-list"
    );
  }
  public async genDummyData<
    const A extends AllProductPaths = AllProductPaths,
    const S extends SelectUnion = SelectUnion,
    const D extends DataApiOpts<S> = DataApiOpts<S>
  >(path: A, qPow: D) {
    const { limit: l, skip: s } = qPow;

    const wow = await this.reusableFetch(path, {
      ...qPow,
      limit: l ?? qPow?.limit ?? 20,
      skip: s ?? qPow.skip ?? 0,
      sortBy: "price",
      order: "desc",
      select: ["description", "title", "price", "id"] satisfies SelectUnion[]
    });

    const getUUIDs = await this.nodeUUID(qPow.limit ?? 20);
    const seederArr = Array.of<{
      id: string;
      name: string;
      description: string;
      price: number;
    }>();

    for (const [idNo, id] of Array.from(getUUIDs.entries())) {
      this.IdMap.set(idNo, id);
    }
    console.log(wow.products);
    for (const [pNo, pData] of Array.from(wow.products.entries())) {
      pData.title;
      pData.description;
      // title -> name
      // dollars -> cents
      // id Int -> UUID
      // only Item id (UUID), cost (cents), and name (title  needed for this endpoint
      const { title: name, description, id: _id, ...restP } = pData;
      const getId = this.IdMap.get(pNo);

      if (getId) {
        seederArr.push({
          id: getId,
          name,
          description,
          price: Math.round(restP.price * 100)
        });
      }
    }
    return seederArr;
  }

  public seeder = async <
    const P extends AllProductPaths,
    const T extends keyof ProductDataFull
  >(
    path = "products" as P,
    qPow: CTR<DataApiOpts<T>, "select">
  ) => {
    return await this.reusableFetch(path, qPow);
  };
}

// const seed = new ItemSeeder();
// if (process.argv[3] === "test") {
//   seed
//     .genDummyData("products", {
//       limit: 20,
//       order: "desc",
//       select: ["price", "id", "title", "description"],
//       skip: 0,
//       sortBy: "price"
//     })
//     .then(v => {
//       const toJSON = JSON.stringify(v, null, 2);
//       const templatize = `export const dummyData = ${toJSON};`;
//       seed.withWs(`src/items/gen/items-data.ts`, templatize);
//     });
// }

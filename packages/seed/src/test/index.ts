import type { AllProductPaths, ProductReviewsSingleton } from "@/types.ts";
import { ItemSeeder } from "@/seed.ts";

function checker(s: string) {
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
const templatize = <const W extends string, const X extends string>(
  constName: W,
  stringifiedTarget: X
) => {
  // prettier-ignore
  return`const ${constName} = ${stringifiedTarget};\n\nexport { ${constName} };` as const
};
const seed = new ItemSeeder();

let path: AllProductPaths;
if (process.argv[2] === "--probe" && process.argv[3] === "init") {
  if (
    process.argv[4] === "--path" &&
    process.argv[5] &&
    checker(process.argv[5])
  ) {
    path = process.argv[5];
  }
 await seed
    .seeder((path ??= "products"), {
      limit: 50,
      order: "desc",
      select: [
        "price",
        "id",
        "title",
        "description",
        "images",
        "reviews",
        "shippingInformation",
        "stock",
        "sku",
        "brand"
      ],
      skip: 0,
      sortBy: "price"
    })
    .then(async v => {
      const r = (await import("node:crypto")).randomUUID;
      const agg = Array.of<{
        id: string;
        name: string;
        title: string;
        price: number;
        stock: number;
        sku: string;
        shippingInformation: string;
        reviews: ProductReviewsSingleton[];
        images: string[];
        brand?: string | undefined | undefined;
      }>();
      for (let i = 0; i <= v.products.length; i++) {
        const internal = r();
        const indexT = v.products[i];

        if (indexT) {
          const { id: _id, description: _descript, ...rest } = indexT;
          agg.push({
            ...rest,
            id: internal,
            price: Math.round(rest.price * 100),
            name: rest.title
          });
        }
      }
      const toJSON = JSON.stringify(agg, null, 2);

      if (process.argv[6] === "--gen" && process.argv[7] === "items") {
        seed.withWs(`src/items/index.ts`, templatize("seededData", toJSON));
      } else {
        seed.withWs(
          `src/test/__out__/${new Date(Date.now()).getTime()}/probe.ts`,
          templatize("probingSeedData", toJSON)
        );
      }
    });
}

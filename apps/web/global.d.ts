/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly VERCEL_ENV: "development" | "production" | "preview";
    }
  }
  declare module "http" {
    interface IncomingHttpHeaders {
      "x-vercel-ip-country"?: string;
      "x-vercel-ip-city"?: string;
      "x-vercel-ip-continent"?: string;
      "x-vercel-forwarded-for"?: string;
      "x-real-ip"?: string;
      "x-vercel-ip-country-region"?: string;
      "x-vercel-ip-postal-code"?: string;
      "x-vercel-signature"?: string;
      "x-vercel-ip-timezone"?: string;
      "x-vercel-ip-latitude"?: string;
      "x-vercel-ip-longitude"?: string;
    }
  }
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

export {};

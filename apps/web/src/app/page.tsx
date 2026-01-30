import { Suspense } from "react";
import { testQuery } from "@/lib/query";
import { LandingPage } from "@/ui/home";

export default async function HomePage() {
  const data = await testQuery();

  return (
    <Suspense fallback={"Loading..."}>
      <LandingPage />
      <div className="border-muted-foreground bg-foreground max-w-full rounded-lg border p-4 shadow-inner">
        <pre className="text-background overflow-x-hidden font-mono text-xs wrap-anywhere break-all whitespace-pre-wrap sm:text-sm">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </Suspense>
  );
}

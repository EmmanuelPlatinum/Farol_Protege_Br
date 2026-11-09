import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the shelter and operations dashboard pages", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/shelters").at(-1)?.routeId).toBe("/_dashboard/shelters");
    expect(router.matchRoutes("/operations").at(-1)?.routeId).toBe("/_dashboard/operations");
  });

  it("matches each public section as its own page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const publicRoutes = [
      ["/about", "/_public/about"],
      ["/report", "/_public/report"],
      ["/conselhos", "/_public/conselhos"],
      ["/tracking", "/_public/tracking"],
      ["/public-shifts", "/_public/public-shifts"],
      ["/transparency", "/_public/transparency"],
    ] as const;

    for (const [path, routeId] of publicRoutes) {
      expect(router.matchRoutes(path).at(-1)?.routeId).toBe(routeId);
    }
  });
});

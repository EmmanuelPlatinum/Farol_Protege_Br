import { createFileRoute } from "@tanstack/react-router";
import { PublicSiteLayout } from "@/components/public-site-layout";

export const Route = createFileRoute("/_public")({
  component: PublicSiteLayout,
});

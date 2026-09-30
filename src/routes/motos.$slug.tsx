import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * TiziFlow does not rent motorbikes on their own: every motorbike is presented
 * on the single fleet page (/motos). Old /motos/:slug links redirect to its
 * section there (/motos#slug), so nothing breaks and search engines merge them.
 */
export const Route = createFileRoute("/motos/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/motos", hash: params.slug, statusCode: 301 });
  },
});
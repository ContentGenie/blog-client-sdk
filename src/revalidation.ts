/**
 * Create a Next.js App Router revalidation handler for Content Genie webhooks.
 *
 * @example
 * ```ts
 * // src/app/api/revalidate/route.ts
 * import { createRevalidationHandler } from "@contentgenie/blog-client-sdk";
 *
 * const handler = createRevalidationHandler({
 *   secret: process.env.REVALIDATION_SECRET!,
 * });
 *
 * export const POST = handler;
 * ```
 */
export function createRevalidationHandler(config: { secret: string }) {
  return async function POST(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { slug, secret, action } = body as {
        slug?: string;
        secret?: string;
        action?: string;
      };

      // Validate secret
      if (!secret || secret !== config.secret) {
        return new Response(
          JSON.stringify({ error: "Invalid secret" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!slug) {
        return new Response(
          JSON.stringify({ error: "Missing slug" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Dynamically import next/cache to avoid breaking non-Next.js environments
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const nextCache = await (Function('return import("next/cache")')() as Promise<{
          revalidateTag: (tag: string) => void;
          revalidatePath: (path: string) => void;
        }>);
        const { revalidateTag, revalidatePath } = nextCache;

        // Revalidate the specific article and the blog listing
        revalidateTag(`article-${slug}`);
        revalidateTag("blog");
        revalidatePath("/blog");

        return new Response(
          JSON.stringify({
            revalidated: true,
            slug,
            action: action || "unknown",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch {
        // next/cache not available — return success anyway since
        // the secret was valid, the consumer just isn't using Next.js
        return new Response(
          JSON.stringify({
            revalidated: false,
            message: "next/cache not available — revalidation skipped",
            slug,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}

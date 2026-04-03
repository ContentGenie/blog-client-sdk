import type {
  Article,
  ArticleListItem,
  Category,
  ContentGenieConfig,
  ListParams,
  PaginatedResponse,
  SearchParams,
  SitemapEntry,
} from "./types";
import { ContentGenieError } from "./types";

const DEFAULT_BASE_URL =
  "https://api.contentgenie.leadtorev.com/api/v1";

/**
 * Client for the Content Genie public blog API.
 *
 * @example
 * ```ts
 * import { ContentGenieClient } from "@contentgenie/blog-client-sdk";
 *
 * const client = new ContentGenieClient({
 *   siteToken: process.env.CONTENT_GENIE_SITE_TOKEN!,
 * });
 *
 * const { articles, pagination } = await client.getArticles({ page: 1, limit: 12 });
 * ```
 */
export class ContentGenieClient {
  private readonly siteToken: string;
  private readonly baseUrl: string;

  constructor(config: ContentGenieConfig) {
    if (!config.siteToken) {
      throw new Error(
        "ContentGenieClient: siteToken is required. " +
          "Pass it via the config object or set the CONTENT_GENIE_SITE_TOKEN env var."
      );
    }
    this.siteToken = config.siteToken;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}/public/blog${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-site-token": this.siteToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      let message: string;
      try {
        const json = JSON.parse(body);
        message = json.detail || json.message || body;
      } catch {
        message = body;
      }
      throw new ContentGenieError(response.status, message);
    }

    return response.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Fetch a paginated list of published articles.
   */
  async getArticles(
    params?: ListParams
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.category) query.category = params.category;
    if (params?.tag) query.tag = params.tag;
    if (params?.funnelStage) query.funnelStage = params.funnelStage;

    return this.request<PaginatedResponse<ArticleListItem>>("/articles", query);
  }

  /**
   * Fetch a single article by its URL slug.
   */
  async getArticleBySlug(slug: string): Promise<Article> {
    return this.request<Article>(`/articles/${encodeURIComponent(slug)}`);
  }

  /**
   * Search published articles by query string.
   */
  async searchArticles(
    params: SearchParams
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const query: Record<string, string> = {
      search: params.query,
    };
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.category) query.category = params.category;

    return this.request<PaginatedResponse<ArticleListItem>>("/articles", query);
  }

  /**
   * Fetch related articles for a given article slug.
   */
  async getRelatedArticles(
    slug: string,
    limit: number = 3
  ): Promise<ArticleListItem[]> {
    return this.request<ArticleListItem[]>(
      `/articles/${encodeURIComponent(slug)}/related`,
      { limit: String(limit) }
    );
  }

  /**
   * Fetch distinct categories from published articles.
   */
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  /**
   * Fetch lightweight slug + date list for sitemap generation.
   */
  async getSitemapEntries(): Promise<SitemapEntry[]> {
    return this.request<SitemapEntry[]>("/sitemap-entries");
  }
}

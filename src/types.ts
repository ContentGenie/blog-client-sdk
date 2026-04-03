// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface ContentGenieConfig {
  /** Site token for authenticating with the Content Genie API. */
  siteToken: string;
  /** Base URL of the Content Genie API. Defaults to production. */
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Article Types
// ---------------------------------------------------------------------------

export interface ArticleListItem {
  slug: string;
  title: string;
  excerpt: string | null;
  primaryKeyword: string;
  category: string | null;
  categorySlug: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  publishedAt: string | null;
  updatedAt: string | null;
  funnelStage: string;
  searchIntent: string;
  contentFormat: string | null;
}

export interface Article extends ArticleListItem {
  contentHtml: string;
  contentMarkdown: string;
  seoKeywords: string[];
  outline: string[];
  keyPoints: string[];
  craftedQuotes: Record<string, unknown>[];
  extractedStatistics: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  articles: T[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

export interface ListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  funnelStage?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  category?: string;
}

// ---------------------------------------------------------------------------
// Category & Sitemap
// ---------------------------------------------------------------------------

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export interface SitemapEntry {
  slug: string;
  publishedAt: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class ContentGenieError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ContentGenieError";
    this.status = status;
  }
}

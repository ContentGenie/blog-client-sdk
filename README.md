# @contentgenie/blog-client-sdk

TypeScript SDK for consuming Content Genie blog articles on client websites.

## Installation

```bash
npm install @contentgenie/blog-client-sdk
```

## Quick Start

```typescript
import { ContentGenieClient } from "@contentgenie/blog-client-sdk";

const client = new ContentGenieClient({
  siteToken: process.env.CONTENT_GENIE_SITE_TOKEN!,
});

// Fetch articles
const { articles, pagination } = await client.getArticles({ page: 1, limit: 12 });

// Fetch single article
const article = await client.getArticleBySlug("my-article-slug");

// Search
const results = await client.searchArticles({ query: "freight shipping" });

// Categories
const categories = await client.getCategories();

// Sitemap entries
const entries = await client.getSitemapEntries();
```

## Revalidation (Next.js)

```typescript
// src/app/api/revalidate/route.ts
import { createRevalidationHandler } from "@contentgenie/blog-client-sdk";

export const POST = createRevalidationHandler({
  secret: process.env.REVALIDATION_SECRET!,
});
```

## Configuration

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `siteToken` | Yes | - | Your website channel's site token |
| `baseUrl` | No | `https://api.contentgenie.leadtorev.com/api/v1` | Content Genie API base URL |

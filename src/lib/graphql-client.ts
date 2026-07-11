// src/lib/graphql-client.ts

const WP_GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://waogpt.com/cms/index.php?graphql';

export interface Author {
  name: string;
  avatar?: {
    url: string;
  };
  description?: string;
}

export interface FeaturedImage {
  sourceUrl: string;
  altText?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  count?: number;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface CommentNode {
  id: string;
  date: string;
  content: string;
  author: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
}

export interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  date: string;
  modified?: string;
  readingTime?: number; // Calculated dynamically
  categories?: {
    nodes: Category[];
  };
  tags?: {
    nodes: Tag[];
  };
  author?: {
    node: Author;
  };
  featuredImage?: {
    node: FeaturedImage;
  };
  comments?: {
    nodes: CommentNode[];
  };
}
// src/lib/graphql-client.ts
// Changes: res.ok check, timeout via AbortController, backoff between
// retries, custom User-Agent (Hostinger/Wordfence-style firewalls
// sometimes rate-limit or block default fetch UAs), and a longer
// default revalidate window to reduce load on shared PHP-FPM workers.

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGraphQL(
  query: string,
  variables: Record<string, any> = {},
  revalidate = 3600 // was 60 — hourly is plenty for blog content;
                     // use on-demand revalidation (webhook) for instant updates
) {
  const MAX_ATTEMPTS = 3;
  let lastError: unknown;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s cap

    try {
      const res = await fetch(WP_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Some Hostinger security plugins (Wordfence etc.) flag
          // generic/missing UAs as bot traffic. A named UA is easier
          // to allowlist if you need to.
          'User-Agent': 'WAOGPT-NextJS-Bot/1.0',
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        // Capture the body for real diagnostics — Hostinger often
        // returns an HTML error/maintenance page here, not JSON.
        const bodyText = await res.text().catch(() => '');
        throw new Error(
          `WPGraphQL HTTP ${res.status} ${res.statusText}: ${bodyText.slice(0, 300)}`
        );
      }

      const json = await res.json();

      if (json.errors) {
        console.error('GraphQL Errors:', json.errors);
        throw new Error(
          `WPGraphQL returned errors: ${JSON.stringify(json.errors).slice(0, 300)}`
        );
      }

      return json.data;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      console.warn(
        `GraphQL request failed (attempt ${i + 1}/${MAX_ATTEMPTS}):`,
        err
      );

      if (i < MAX_ATTEMPTS - 1) {
        // backoff: 500ms, 1500ms — gives Hostinger's PHP-FPM pool
        // a moment to free up a worker instead of hitting it again instantly
        await sleep(500 * (i + 1) ** 2);
      }
    }
  }

  throw lastError;
}
// 1. Get all posts with optional pagination, category filter, and search
export async function getPosts(first = 10, after: string | null = null, categorySlug?: string, search?: string) {
  const query = `
    query GetPosts($first: Int, $after: String, $categorySlug: String, $search: String) {
      posts(
        first: $first
        after: $after
        where: { categoryName: $categorySlug, search: $search, status: PUBLISH }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          databaseId
          title
          slug
          excerpt
          date
          author {
            node {
              name
              avatar {
                url
              }
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
          tags {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { first, after, categorySlug, search });
  return data?.posts;
}

// 2. Get detailed post by Slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        databaseId
        title
        slug
        excerpt
        content
        date
        modified
        author {
          node {
            name
            avatar {
              url
            }
            description
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        comments(first: 100, where: { orderby: COMMENT_DATE_GMT, order: ASC }) {
          nodes {
            id
            date
            content
            author {
              node {
                name
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { slug });
  return data?.post || null;
}

// 3. Get all categories
export async function getCategories() {
  const query = `
    query GetCategories {
      categories(first: 20, where: { hideEmpty: true }) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  `;
  const data = await fetchGraphQL(query);
  return data?.categories?.nodes || [];
}

// 4. Get popular tags
export async function getTags() {
  const query = `
    query GetTags {
      tags(first: 25, where: { orderby: COUNT, order: DESC }) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  `;
  const data = await fetchGraphQL(query);
  return data?.tags?.nodes || [];
}

// 5. Get featured posts
export async function getFeaturedPost(): Promise<Post | null> {
  const postsData = await getPosts(1);
  return postsData?.nodes?.[0] || null;
}

// 6. Get trending posts
export async function getTrendingPosts(first = 5) {
  const query = `
    query GetTrendingPosts($first: Int) {
      posts(first: $first, where: { orderby: { field: COMMENT_COUNT, order: DESC }, status: PUBLISH }) {
        nodes {
          id
          databaseId
          title
          slug
          date
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { first });
  if (!data?.posts?.nodes || data.posts.nodes.length === 0) {
    const fallback = await getPosts(first);
    return fallback?.nodes || [];
  }
  return data?.posts?.nodes;
}

// 7. Get related posts based on categories
export async function getRelatedPosts(categorySlug?: string, currentPostId?: string, first = 3) {
  const query = `
    query GetRelatedPosts($first: Int, $categorySlug: String) {
      posts(first: $first, where: { categoryName: $categorySlug, status: PUBLISH }) {
        nodes {
          id
          databaseId
          title
          slug
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(query, { first: first + 1, categorySlug });
  const nodes: Post[] = data?.posts?.nodes || [];
  return nodes.filter(post => post.id !== currentPostId).slice(0, first);
}

// 8. Submit comment mutation
export async function createComment(postId: number, author: string, authorEmail: string, content: string) {
  const mutation = `
    mutation CreateComment($postId: Int!, $author: String!, $authorEmail: String!, $content: String!) {
      createComment(
        input: {
          commentOn: $postId
          author: $author
          authorEmail: $authorEmail
          content: $content
        }
      ) {
        success
        comment {
          id
          date
          content
          author {
            node {
              name
            }
          }
        }
      }
    }
  `;
  const data = await fetchGraphQL(mutation, { postId, author, authorEmail, content });
  return data?.createComment;
}

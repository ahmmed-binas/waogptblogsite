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

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
  const attempt = async () => {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });
    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error('Failed to fetch API');
    }
    return json.data;
  };

  try {
    return await attempt();
  } catch (err) {
    console.warn('GraphQL request failed, retrying once...', err);
    return await attempt(); // let this one throw for real if it fails again
  }
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

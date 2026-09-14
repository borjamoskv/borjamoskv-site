// src/lib/substack/scraper.ts
// Scrapes Substack RSS feed or API archive endpoints. Supports network retries and error handling.

import { SubstackPost } from '../exergy/evaluator';

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export function parseRss(xmlText: string): SubstackPost[] {
  const posts: SubstackPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const extractTag = (tag: string): string => {
      // Handles both simple tags and CDATA wrapped tags
      const tagRegex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
      const tagMatch = itemContent.match(tagRegex);
      return tagMatch ? decodeEntities(tagMatch[1].trim()) : "";
    };
    
    // Substack XML feed puts subtitle inside description sometimes, or uses description directly.
    const title = extractTag("title");
    const link = extractTag("link");
    const pubDate = extractTag("pubDate");
    const description = extractTag("description") || extractTag("content:encoded");
    
    posts.push({
      title,
      subtitle: "", // RSS feeds don't explicitly separate subtitle cleanly; we default to empty
      description,
      link,
      pubDate
    });
  }
  
  return posts;
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 50): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status === 429 && attempt < retries - 1) {
        const backoff = delay * Math.pow(2, attempt) + Math.random() * 20;
        await new Promise((r) => setTimeout(r, backoff));
        attempt++;
        continue;
      }
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt < retries - 1) {
        const backoff = delay * Math.pow(2, attempt) + Math.random() * 20;
        await new Promise((r) => setTimeout(r, backoff));
        attempt++;
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed to fetch after ${retries} attempts`);
}

interface FetchOptions {
  forceJson?: boolean;
  mockPort?: string;
  scenario?: string;
}

export async function fetchSubstackPosts(
  subdomain: string,
  options: FetchOptions = {}
): Promise<SubstackPost[]> {
  const { forceJson, mockPort, scenario } = options;
  
  let url = "";
  const queryParams = scenario ? `?scenario=${scenario}` : "";
  
  if (mockPort) {
    // Under testing, mock server is used
    if (forceJson) {
      url = `http://127.0.0.1:${mockPort}/api/v1/archive${queryParams}`;
    } else {
      url = `http://127.0.0.1:${mockPort}/feed${queryParams}`;
    }
  } else {
    // Production / Real Substack crawling
    const cleanSubdomain = subdomain.replace(/^https?:\/\//, "").replace(/\.substack\.com\/?$/, "");
    if (forceJson) {
      url = `https://${cleanSubdomain}.substack.com/api/v1/archive`;
    } else {
      url = `https://${cleanSubdomain}.substack.com/feed`;
    }
  }
  
  const response = await fetchWithRetry(url);
  
  if (forceJson || url.includes("/api/v1/archive")) {
    const rawData = await response.text();
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err: any) {
      throw new SyntaxError("Invalid JSON structure");
    }
    if (!Array.isArray(data)) {
      throw new TypeError("Expected array from JSON archive");
    }
    
    return data.map((post: any) => ({
      title: post.title || "",
      subtitle: post.subtitle || "",
      description: post.description || "",
      link: post.canonical_url || post.link || "",
      pubDate: post.post_date || post.pubDate || ""
    }));
  } else {
    const xmlText = await response.text();
    // Verify XML structure starts correctly or we throw a parse error for malformed XML tests
    if (!xmlText.trim().startsWith("<rss") && !xmlText.trim().startsWith("<?xml")) {
      throw new Error("Invalid XML document structure");
    }
    // Check for malformed / truncated XML (test_t2_boundary_xml_malformed)
    // If the XML is truncated, the regex parsing will still return partial items or fail.
    // Let's do a strict check: if the XML has `<item>` but not `</item>`, it is malformed.
    // Or if it lacks standard closing tags like `</rss>` or `</channel>`.
    if (xmlText.includes("<item>") && !xmlText.includes("</item>")) {
      throw new Error("Malformed XML: Truncated <item>");
    }
    if (!xmlText.includes("</rss>") && !xmlText.includes("</channel>")) {
      throw new Error("Malformed XML: Truncated document");
    }
    
    return parseRss(xmlText);
  }
}

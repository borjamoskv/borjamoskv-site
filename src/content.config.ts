// C5-REAL
import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sentiment: z.string().optional(),
  })
});

export const collections = { articles };

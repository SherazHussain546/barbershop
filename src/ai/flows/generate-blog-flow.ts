
'use server';
/**
 * @fileOverview A flow to generate SEO-rich blog posts for the Gentlecut Guild.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBlogInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  keywords: z.array(z.string()).optional().describe('Keywords to include for SEO.'),
  targetAudience: z.string().optional().describe('The primary audience (e.g., modern gentlemen, young professionals).'),
});
export type GenerateBlogInput = z.infer<typeof GenerateBlogInputSchema>;

const GenerateBlogOutputSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title.'),
  excerpt: z.string().describe('A 2-3 sentence summary of the post.'),
  content: z.string().describe('The full blog post content in Markdown format, at least 600 words.'),
  suggestedSlug: z.string().describe('A suggested URL slug.'),
});
export type GenerateBlogOutput = z.infer<typeof GenerateBlogOutputSchema>;

export async function generateBlog(input: GenerateBlogInput): Promise<GenerateBlogOutput> {
  return generateBlogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPrompt',
  input: { schema: GenerateBlogInputSchema },
  output: { schema: GenerateBlogOutputSchema },
  prompt: `You are a high-end copywriter for Gentlecut Guild, a premium barbershop.
Your task is to write a sophisticated, engaging, and SEO-rich blog post.

Topic: {{{topic}}}
Keywords: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Target Audience: {{{targetAudience}}}

Guidelines:
1. Tone: Professional, authoritative, yet approachable and stylish.
2. Structure: Use H2 and H3 headers, bullet points, and numbered lists for readability.
3. Content: Provide practical grooming tips, style advice, or insights into barbershop culture.
4. Length: Aim for a detailed and informative post (approx. 600-800 words).
5. SEO: Naturally weave in the provided keywords.

Format the output as JSON with the specified schema.`,
});

const generateBlogFlow = ai.defineFlow(
  {
    name: 'generateBlogFlow',
    inputSchema: GenerateBlogInputSchema,
    outputSchema: GenerateBlogOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

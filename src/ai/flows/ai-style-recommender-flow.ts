'use server';
/**
 * @fileOverview An AI-powered tool for suggesting hairstyles and beard styles.
 *
 * - aiStyleRecommender - A function that handles the AI style recommendation process.
 * - AiStyleRecommenderInput - The input type for the aiStyleRecommender function.
 * - AiStyleRecommenderOutput - The return type for the aiStyleRecommender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiStyleRecommenderInputSchema = z.object({
  faceShape: z.string().describe('The customer\'s face shape (e.g., oval, round, square).'),
  hairType: z.string().describe('The customer\'s hair type (e.g., straight, wavy, curly, thin, thick).'),
  desiredAesthetic: z.string().describe('The customer\'s desired aesthetic or style (e.g., classic, modern, edgy, low maintenance).'),
  currentLookPhoto: z
    .string()
    .optional()
    .describe(
      "An optional photo of the customer's current look, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiStyleRecommenderInput = z.infer<typeof AiStyleRecommenderInputSchema>;

const AiStyleRecommenderOutputSchema = z.object({
  hairstyleSuggestions: z.array(z.string()).describe('A list of suggested hairstyles tailored to the customer\'s input.'),
  beardStyleSuggestions: z.array(z.string()).describe('A list of suggested beard styles tailored to the customer\'s input.'),
  recommendationRationale: z.string().describe('A detailed explanation of why these styles were recommended based on the provided inputs.'),
});
export type AiStyleRecommenderOutput = z.infer<typeof AiStyleRecommenderOutputSchema>;

export async function aiStyleRecommender(input: AiStyleRecommenderInput): Promise<AiStyleRecommenderOutput> {
  return aiStyleRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStyleRecommenderPrompt',
  input: {schema: AiStyleRecommenderInputSchema},
  output: {schema: AiStyleRecommenderOutputSchema},
  prompt: `You are an expert barber and style consultant at Barber shop. Your task is to provide personalized hairstyle and beard style suggestions to customers based on their preferences and characteristics.

Here is the customer's information:
- Face Shape: {{{faceShape}}}
- Hair Type: {{{hairType}}}
- Desired Aesthetic: {{{desiredAesthetic}}}

{{#if currentLookPhoto}}
Customer's Current Look: {{media url=currentLookPhoto}}
{{/if}}

Based on the information provided, recommend suitable hairstyles and beard styles. Explain your rationale for each suggestion, considering how it complements their face shape, hair type, and desired aesthetic. Ensure the suggestions are practical and stylish.

Provide your response in a structured JSON format, including a list of hairstyle suggestions, a list of beard style suggestions, and a detailed rationale for your recommendations.`,
});

const aiStyleRecommenderFlow = ai.defineFlow(
  {
    name: 'aiStyleRecommenderFlow',
    inputSchema: AiStyleRecommenderInputSchema,
    outputSchema: AiStyleRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

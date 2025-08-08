'use server';

/**
 * @fileOverview An AI agent for extracting flight information from claim attachments.
 *
 * - extractFlightInfo - A function that handles the flight information extraction process.
 * - ExtractFlightInfoInput - The input type for the extractFlightInfo function.
 * - ExtractFlightInfoOutput - The return type for the extractFlightInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractFlightInfoInputSchema = z.object({
  attachmentDataUri: z
    .string()
    .describe(
      "A flight attachment (boarding pass, ticket) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  attachmentName: z.string().describe('The name of the attachment file.'),
});
export type ExtractFlightInfoInput = z.infer<typeof ExtractFlightInfoInputSchema>;

const ExtractFlightInfoOutputSchema = z.object({
  flightNumber: z.string().describe('The flight number extracted from the attachment.'),
  flightDate: z.string().describe('The flight date extracted from the attachment (YYYY-MM-DD).'),
});
export type ExtractFlightInfoOutput = z.infer<typeof ExtractFlightInfoOutputSchema>;

export async function extractFlightInfo(input: ExtractFlightInfoInput): Promise<ExtractFlightInfoOutput> {
  return extractFlightInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractFlightInfoPrompt',
  input: {schema: ExtractFlightInfoInputSchema},
  output: {schema: ExtractFlightInfoOutputSchema},
  prompt: `You are an expert data extraction specialist for Vietnam Airlines loyalty program.

You will extract the flight number and flight date from the provided flight attachment. The flight date should be formatted as YYYY-MM-DD.

Attachment Name: {{{attachmentName}}}
Attachment: {{media url=attachmentDataUri}}

If you can not reliably determine the flight number or date, return an empty string.

Ensure that all output fields are populated according to the schema.
`,
});

const extractFlightInfoFlow = ai.defineFlow(
  {
    name: 'extractFlightInfoFlow',
    inputSchema: ExtractFlightInfoInputSchema,
    outputSchema: ExtractFlightInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

import { NextResponse } from 'next/server';
import { z } from 'zod';

const claimSchema = z.object({
  flightNumber: z.string().min(3, "Flight number is required."),
  flightDate: z.string().datetime(),
  attachment: z.string().optional(), // In reality, this would be a file path or URL
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedFields = claimSchema.safeParse(json);

    if (!validatedFields.success) {
      return NextResponse.json({
        errors: validatedFields.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    // Simulate saving to a database
    console.log("Submitting claim via API:", validatedFields.data);
    // Here you would:
    // 1. Upload attachment to Firebase Storage (if provided)
    // 2. Save claim data to Firestore with status 'pending'

    // Revalidation would happen via webhook or after client-side navigation
    
    return NextResponse.json({
      message: "Your claim has been submitted successfully.",
    });
  } catch (error) {
    console.error("Claim submission error:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}

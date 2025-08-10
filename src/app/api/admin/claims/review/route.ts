import { NextResponse } from 'next/server';
import { z } from 'zod';
import { awardMiles } from "@/lib/sessionm-mock";

const reviewSchema = z.object({
  claimId: z.string(),
  status: z.enum(["approved", "rejected"]),
  userId: z.string(),
  miles: z.number(),
});

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const validatedFields = reviewSchema.safeParse(json);

        if (!validatedFields.success) {
            return NextResponse.json({
                errors: validatedFields.error.flatten().fieldErrors,
            }, { status: 400 });
        }
        
        const { claimId, status, userId, miles } = validatedFields.data;

        console.log(`Reviewing claim ${claimId} via API: ${status}`);

        // Simulate updating database
        // 1. Find claim in Firestore by claimId
        // 2. Update its status
        if (status === 'approved') {
            // 3. Add miles to user's total in Firestore
            console.log(`Awarding ${miles} miles to user ${userId}`);
            // 4. Call mock SessionM hook
            await awardMiles(userId, miles);
        }
        // 5. Create a record in miles_history collection

        return NextResponse.json({
            message: `Claim ${claimId} has been ${status}.`
        });

    } catch (error) {
        console.error("Claim review error:", error);
        return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
    }
}

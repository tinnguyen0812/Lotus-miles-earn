// This file is a placeholder for server actions.
// In a real application, you would replace the mock data logic
// with actual database operations (e.g., using Firebase Admin SDK).
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { awardMiles } from "@/lib/sessionm-mock";

const claimSchema = z.object({
  flightNumber: z.string().min(3, "Flight number is required."),
  flightDate: z.date(),
  attachment: z.string().optional(), // In reality, this would be a file path or URL
});

export async function submitClaim(prevState: any, formData: FormData) {
  const validatedFields = claimSchema.safeParse({
    flightNumber: formData.get("flightNumber"),
    flightDate: new Date(formData.get("flightDate") as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Simulate saving to a database
  console.log("Submitting claim:", validatedFields.data);
  // Here you would:
  // 1. Upload attachment to Firebase Storage
  // 2. Save claim data to Firestore with status 'pending'

  revalidatePath("/dashboard");
  revalidatePath("/claim-miles");

  return {
    message: "Your claim has been submitted successfully.",
  };
}


export async function reviewClaim(claimId: string, status: "approved" | "rejected", userId: string, miles: number) {
  console.log(`Reviewing claim ${claimId}: ${status}`);

  // Simulate updating database
  // 1. Find claim in Firestore by claimId
  // 2. Update its status
  if (status === 'approved') {
    // 3. Add miles to user's total in Firestore
    console.log(`Awarding ${miles} miles to user ${userId}`);
    // 4. Call mock SessionM hook
    awardMiles(userId, miles);
  }
  // 5. Create a record in miles_history collection

  revalidatePath("/admin/claims");
  revalidatePath("/dashboard"); // To update user's claims list

  return {
    message: `Claim ${claimId} has been ${status}.`
  }
}

/**
 * Mock function to simulate interacting with SessionM or another external loyalty system.
 * In a real-world scenario, this would involve making an authenticated API call.
 */

export function awardMiles(userId: string, miles: number): Promise<{ success: boolean; transactionId: string }> {
  console.log(`[SessionM Mock] Awarding ${miles} miles to user ${userId}.`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const transactionId = `SESSM_${Date.now()}`;
      console.log(`[SessionM Mock] Successfully awarded miles. Transaction ID: ${transactionId}`);
      resolve({ success: true, transactionId });
    }, 500); // Simulate network latency
  });
}

# **App Name**: Lotus Loyalty Hub

## Core Features:

- User Authentication: Authentication via Email/Password using Firebase Auth for both member and admin roles.
- Manual Miles Claim: Members can submit manual miles claims with flight details and attachments, stored in Firestore and Storage.
- Admin Claim Review: Admins can review and approve/reject claims, updating user miles and recording history using a Cloud Function.
- Dashboard: Display total miles, claim status, and other relevant information on a dashboard.
- AI-Powered Claim Info Extraction: Tool to analyze claim attachments (boarding passes, tickets) using a generative AI model to automatically extract flight number and date to assist in claim processing.
- SessionM Mock Integration: Mock SessionM hook to simulate interaction with an external loyalty system when a claim is approved.
- i18n Support: Multi-language support (Vietnamese and English) for all UI elements.

## Style Guidelines:

- Primary color: Vietnam Airlines blue (#006A9B), reflecting the airline's brand identity and providing a sense of trust and reliability.
- Secondary color: Vietnam Airlines gold (#D4A753), used sparingly to highlight important elements and convey a sense of premium quality and luxury.
- Background color: Off-white (#F8F8F8), providing a clean and modern backdrop that ensures readability and highlights the primary and secondary colors.
- Body and headline font: 'Roboto', a modern sans-serif font that offers excellent readability and a clean, contemporary aesthetic.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, professional icons that align with the airline's branding, incorporating subtle aviation themes.
- Subtle and professional transitions and animations to enhance user experience, such as loading indicators and smooth navigation transitions.
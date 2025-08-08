import { LotusIcon } from "@/components/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <LotusIcon className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Lotus Loyalty Hub
        </h1>
      </div>
      {children}
    </main>
  );
}

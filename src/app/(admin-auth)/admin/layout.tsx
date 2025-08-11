// layout “trống” chỉ cho nhóm route /admin/(auth)/*
export default function AdminAuthLayout({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}

// app/(admin)/members/[id]/page.tsx
import AdminShell from "@/components/layout/admin/AdminShell";
import MemberDetail from "@/components/admin/MemberDetail";

export default function Page({ params }: { params: { id: string } }) {
    return (
        <MemberDetail memberId={params.id} />
    );
}

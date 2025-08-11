import type { Claim } from "@/lib/types";

export const claims: Claim[] = [
  {
    id: "MR-2024-001",
    submittedAt: "2024-01-15T07:30:00Z",
    status: "pending",
    milesRequested: 1250,
    reason: "Miles not credited after flight.",
    member: {
      id: "LM001234",
      name: "Nguyễn Thị Lan",
      email: "lan.nguyen@example.com",
      phone: "+84 987 111 222",
      tier: "Gold",
      milesTotal: 45230,
      avatarUrl: ""
    },
    flight: {
      number: "VN123",
      date: "2024-01-10T00:00:00Z",
      route: "HAN → SGN",
      cabin: "Business",
      seat: "3A",
      distanceKm: 1166
    },
    attachments: [
      { id: "a1", name: "boarding-pass.pdf", url: "#", type: "pdf", size: 2_100_000 },
      { id: "a2", name: "ticket-receipt.jpg", url: "#", type: "image/jpeg", size: 1_800_000 }
    ]
  },
  {
    id: "MR-2024-002",
    submittedAt: "2024-01-14T05:10:00Z",
    status: "pending",
    milesRequested: 800,
    reason: "Hotel partner stay not posted.",
    member: {
      id: "LM005678",
      name: "Trần Văn Minh",
      email: "minh.tran@example.com",
      phone: "+84 932 333 444",
      tier: "Silver",
      milesTotal: 15400,
      avatarUrl: ""
    },
    flight: {
      number: "PARTNER",
      date: "2024-01-09T00:00:00Z",
      route: "Intercontinental",
      cabin: "—",
      seat: "",
      distanceKm: undefined
    },
    attachments: []
  },
  {
    id: "MR-2024-003",
    submittedAt: "2024-01-13T08:45:00Z",
    status: "pending",
    milesRequested: 450,
    reason: "Car rental miles missing.",
    member: {
      id: "LM009012",
      name: "Lê Thị Hương",
      email: "huong.le@example.com",
      phone: "+84 936 555 666",
      tier: "Platinum",
      milesTotal: 60210,
      avatarUrl: ""
    },
    flight: {
      number: "RENTAL",
      date: "2024-01-08T00:00:00Z",
      route: "Avis · 3 days",
      cabin: "—",
      seat: "",
      distanceKm: undefined
    },
    attachments: []
  }
];

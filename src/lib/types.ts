export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export interface MemberLite {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier?: string;
  milesTotal?: number;
  avatarUrl?: string;
}

export interface FlightInfo {
  number: string;      // VN123
  date: string;        // ISO
  route: string;       // "HAN → SGN"
  cabin: string;       // "Business"
  seat?: string;
  distanceKm?: number;
}

export interface Claim {
  id: string;
  submittedAt: string;     // ISO
  status: ClaimStatus;
  milesRequested: number;
  reason?: string;
  member: MemberLite;
  flight: FlightInfo;
  attachments?: Attachment[];
}

export interface ClaimsSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalMiles: number;
}

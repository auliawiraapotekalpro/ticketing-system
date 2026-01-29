
export enum UserRole {
  OUTLET = 'OUTLET',
  ADMIN = 'ADMIN'
}

export enum TicketStatus {
  PENDING = 'PENDING',
  PLANNED = 'PLANNED',
  FINISHED = 'FINISHED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Ticket {
  id: string;
  storeName: string;
  reportDate: string;
  problemIndicator: string;
  riskLevel: RiskLevel;
  businessImpact: string;
  recommendation: string;
  photos: string[]; // Base64 or Blob URLs
  status: TicketStatus;
  
  // Admin filled fields
  department?: string;
  picName?: string;
  plannedDate?: string;
  targetEndDate?: string;
  actualFinishedDate?: string; // New field for actual completion date
  
  // Timestamps
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Job {
  id: number;
  title: string;
  companyName: string;
  description?: string;
  location?: string;
  status: string;
  type: string;
  relatedUserId: number;
  relatedUserName: string;
  createdAt: string;
}

export interface JobCreateRequest {
  title: string;
  companyName: string;
  description?: string;
  location?: string;
  status: string;
  type: string;
  relatedUserId: number;
}

export interface JobUpdateRequest {
  title: string;
  companyName: string;
  description?: string;
  location?: string;
  status: string;
  type: string;
  relatedUserId: number;
}

export const JOB_STATUSES = ['Open', 'Closed', 'Draft'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

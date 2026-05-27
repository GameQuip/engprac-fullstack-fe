export interface JobApplication {
  id: number;
  status: string;
  appliedAt: string;
  job: {
    id: number;
    title: string;
    companyName: string;
    location?: string;
  };
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

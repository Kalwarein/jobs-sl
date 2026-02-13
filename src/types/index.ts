export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  category: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedAt: string;
  deadline?: string;
  isVerified: boolean;
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface JobCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected';
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  postedBy: string;
  postedAt: string;
  status: 'open' | 'in_progress' | 'completed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'job_seeker' | 'employer' | 'freelancer' | 'admin';
  avatar?: string;
  bio?: string;
  skills: string[];
  location: string;
  profileCompletion: number;
  isVerified: boolean;
}

export type UserRole = 'job_seeker' | 'employer' | 'freelancer' | 'admin';

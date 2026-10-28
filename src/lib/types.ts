export type Gender = 'male' | 'female';
export type Occasion = 'karwa' | 'shaadi' | 'fun';

export interface Candidate {
  id: string;
  name: string;
}
export interface QuizMeta {
  id: string;
  subjectName: string;
  subjectGender: Gender;
  occasion: Occasion;
  candidates: Candidate[];
  voteCount: number;
  createdAt: string;
  expiresAt: string;
}
export interface Voter {
  nick: string | null;
  candidateId: string;
  at: number;
}
export interface QuizResults {
  total: number;
  tallies: Record<string, number>;
  voters: Voter[];
}
export interface CreatePayload {
  subjectName: string;
  subjectGender: Gender;
  occasion: Occasion;
  candidates: string[];
  nick: string;
  pickIndex: number;
  voterToken: string;
  website?: string;
}
export interface CreateResponse {
  id: string;
  creatorKey: string;
  candidates: Candidate[];
  pickId: string;
}

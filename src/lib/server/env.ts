export const TTL_DAYS = Math.min(60, Math.max(1, Number(process.env.NEXT_PUBLIC_QUIZ_TTL_DAYS) || 14));
export const MAX_VOTES = Math.min(2000, Math.max(10, Number(process.env.MAX_VOTES_PER_QUIZ) || 500));
export const MAX_VOTES_PER_IP = 8;

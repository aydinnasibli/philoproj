export const wc = (s: string) => s.trim() ? s.split(/\s+/).filter(Boolean).length : 0;

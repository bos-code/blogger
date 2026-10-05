export interface DailyStat {
  date: string; // YYYY-MM-DD
  views: number;
  posts: Record<string, number>;
}

export const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Fills in missing days so charts show a continuous range ending today. */
export const fillDays = (stats: DailyStat[], days: number, today = new Date()): DailyStat[] => {
  const byDate = new Map(stats.map((stat) => [stat.date, stat]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    const key = dayKey(date);
    return byDate.get(key) ?? { date: key, views: 0, posts: {} };
  });
};

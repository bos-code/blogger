import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useRole } from "./useRole";
import { dayKey, fillDays, type DailyStat } from "../utils/analytics";

export type { DailyStat };

/** Daily view totals for the last `days` days (administrators only). */
export const useDailyStats = (days = 30) => {
  const { isAdmin, isEmailVerified } = useRole();

  return useQuery<DailyStat[]>({
    queryKey: ["dailyStats", days],
    queryFn: async () => {
      const start = new Date();
      start.setUTCDate(start.getUTCDate() - (days - 1));
      const snapshot = await getDocs(
        query(collection(db, "dailyStats"), where("date", ">=", dayKey(start)), orderBy("date"))
      );
      const stats = snapshot.docs.map((statDoc) => {
        const data = statDoc.data();
        return {
          date: String(data.date ?? statDoc.id),
          views: Number(data.views ?? 0),
          posts: (data.posts ?? {}) as Record<string, number>,
        };
      });
      return fillDays(stats, days);
    },
    enabled: isAdmin && isEmailVerified,
    staleTime: 5 * 60 * 1000,
  });
};

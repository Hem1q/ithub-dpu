import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUser() {
  return useQuery({
    queryKey: [api.user.get.path],
    queryFn: async () => {
      const res = await fetch(api.user.get.path, { credentials: "include" });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return api.user.get.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache user for 5 mins
  });
}

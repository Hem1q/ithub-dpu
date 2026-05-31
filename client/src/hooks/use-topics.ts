import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useTopics() {
  return useQuery({
    queryKey: [api.topics.list.path],
    queryFn: async () => {
      const res = await fetch(api.topics.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch topics");
      return api.topics.list.responses[200].parse(await res.json());
    },
  });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: [api.topics.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.topics.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch topic");
      return api.topics.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

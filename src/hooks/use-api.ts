import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// Example hook for fetching data
export function useGetData<T>(key: string, url: string) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const { data } = await api.get<T>(url);
      return data;
    },
  });
}

// Example hook for posting data
export function usePostData<T>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, payload }: { url: string; payload: unknown }) => {
      const { data } = await api.post<T>(url, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
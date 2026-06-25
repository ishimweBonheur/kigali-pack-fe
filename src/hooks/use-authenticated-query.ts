"use client";

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from "@tanstack/react-query";
import { useAuthReady } from "@/providers/auth-ready-context";

export function useAuthenticatedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { authReady } = useAuthReady();

  return useQuery({
    ...options,
    enabled: authReady && (options.enabled ?? true),
  });
}

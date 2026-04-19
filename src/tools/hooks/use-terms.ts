"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTerms,
  getAllTerms,
  getTermByName,
  searchTerms,
} from "../actions/terms.actions";

const QUERY_KEYS = {
  all: ["terms", "all"],
  flat: ["terms", "flat"],
  byName: (name: string) => ["terms", "name", name],
  search: (query: string) => ["terms", "search", query],
};

export function useTerms() {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: () => getTerms(),
  });
}

export function useAllTerms() {
  return useQuery({
    queryKey: QUERY_KEYS.flat,
    queryFn: () => getAllTerms(),
  });
}

export function useTermByName(name: string | null) {
  return useQuery({
    queryKey: name ? QUERY_KEYS.byName(name) : [],
    queryFn: () => getTermByName(name!),
    enabled: !!name,
  });
}

export function useTermSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => searchTerms(query),
    enabled: query.trim().length > 0,
  });
}

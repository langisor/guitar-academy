"use server";

import { TermsService } from "../services/terms.service";
import { Term, TermsData } from "../types/terms.types";

const service = TermsService.getInstance();

export async function getTerms(): Promise<TermsData> {
  return service.getTerms();
}

export async function getAllTerms(): Promise<Term[]> {
  return service.getAllTerms();
}

export async function getTermByName(name: string): Promise<Term | null> {
  return service.getTermByName(name);
}

export async function searchTerms(query: string): Promise<Term[]> {
  return service.searchTerms(query);
}

export async function getTermTooltip(term: string): Promise<{ term: string; definition: string } | null> {
  return service.getTermTooltip(term);
}

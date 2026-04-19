export interface Term {
  term: string;
  definition: string;
}

export interface TermCategory {
  name: string;
  terms: Term[];
}

export interface TermsData {
  categories: TermCategory[];
}

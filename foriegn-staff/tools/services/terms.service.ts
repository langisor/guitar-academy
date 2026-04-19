import { TermsRepository } from "../repositories/terms.repository";
import { Term, TermsData } from "../types/terms.types";

export class TermsService {
  private static instance: TermsService;
  private repo: TermsRepository;

  private constructor() {
    this.repo = TermsRepository.getInstance();
  }

  public static getInstance(): TermsService {
    if (!TermsService.instance) {
      TermsService.instance = new TermsService();
    }
    return TermsService.instance;
  }

  async getTerms(): Promise<TermsData> {
    return this.repo.getTerms();
  }

  async getAllTerms(): Promise<Term[]> {
    return this.repo.getAllTerms();
  }

  async getTermByName(name: string): Promise<Term | null> {
    return this.repo.getTermByName(name);
  }

  async searchTerms(query: string): Promise<Term[]> {
    return this.repo.searchTerms(query);
  }

  async getTermTooltip(term: string): Promise<{ term: string; definition: string } | null> {
    const found = await this.repo.getTermByName(term);
    if (!found) return null;
    return {
      term: found.term,
      definition: found.definition,
    };
  }
}

import { promises as fs } from "fs";
import path from "path";
import { Term, TermsData } from "../types/terms.types";

export class TermsRepository {
  private static instance: TermsRepository;

  private cache: TermsData | null = null;
  private index: Map<string, Term> = new Map();
  private flatTerms: Term[] = [];
  private loadingPromise: Promise<TermsData> | null = null;

  private constructor() {}

  public static getInstance(): TermsRepository {
    if (!TermsRepository.instance) {
      TermsRepository.instance = new TermsRepository();
    }
    return TermsRepository.instance;
  }

  private async load(): Promise<TermsData> {
    if (this.cache) return this.cache;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const filePath = path.resolve(
        process.cwd(),
        "src/chords/data/terms.json"
      );

      const raw = await fs.readFile(filePath, "utf-8");
      const parsed: TermsData = JSON.parse(raw);

      this.cache = parsed;
      this.buildIndex(parsed);

      return parsed;
    })();

    return this.loadingPromise;
  }

  private buildIndex(data: TermsData): void {
    this.index.clear();
    this.flatTerms = [];

    for (const category of data.categories) {
      for (const term of category.terms) {
        const normalizedKey = term.term.toLowerCase();
        this.index.set(normalizedKey, term);
        this.flatTerms.push(term);
      }
    }
  }

  private async ensureLoaded(): Promise<TermsData> {
    return this.load();
  }

  async getTerms(): Promise<TermsData> {
    return this.ensureLoaded();
  }

  async getAllTerms(): Promise<Term[]> {
    await this.ensureLoaded();
    return this.flatTerms;
  }

  async getTermByName(name: string): Promise<Term | null> {
    await this.ensureLoaded();
    return this.index.get(name.toLowerCase()) ?? null;
  }

  async searchTerms(query: string): Promise<Term[]> {
    await this.ensureLoaded();
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return this.flatTerms.filter((term) =>
      term.term.toLowerCase().includes(q)
    );
  }

  clearCache(): void {
    this.cache = null;
    this.index.clear();
    this.flatTerms = [];
    this.loadingPromise = null;
  }
}

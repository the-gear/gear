/**
 * Represents identifier
 */
export abstract class Identifier {
  public suggestions = new Map<string, number>();

  constructor(public name: string | null) {}

  suggestName(suggestion: string): this {
    const val = this.suggestions.get(suggestion) || 0;
    this.suggestions.set(suggestion, val + 1);
    return this;
  }

  suggestNames(...suggestions: string[]): this {
    for (const suggestion of suggestions) {
      this.suggestName(suggestion);
    }
    return this;
  }
}

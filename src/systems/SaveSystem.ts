import type { CBRCase, GameSaveState } from "../types";

const saveKey = "vale-dos-casos-save-vite";
const casesKey = "vale-dos-casos-cases-vite";
const oldCausosSaveKey = "vale-dos-causos-save-vite";
const oldCausosCasesKey = "vale-dos-causos-cases-vite";
const legacySaveKey = "fazendinha-cbr-save-vite";
const legacyCasesKey = "fazendinha-cbr-cases-vite";

function firstStoredValue(key: string, legacyKeys: string[] = []): string | null {
  return [key, ...legacyKeys].map((candidate) => localStorage.getItem(candidate)).find((value) => value !== null) ?? null;
}

function readJson<T>(key: string, fallback: T, legacyKeys: string[] = []): T {
  const raw = firstStoredValue(key, legacyKeys);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Falha ao ler ${key} no LocalStorage`, error);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export class SaveSystem {
  static readonly saveKey = saveKey;
  static readonly casesKey = casesKey;

  static hasGame(): boolean {
    return firstStoredValue(saveKey, [oldCausosSaveKey, legacySaveKey]) !== null;
  }

  static loadGame(): GameSaveState | null {
    return readJson<GameSaveState | null>(saveKey, null, [oldCausosSaveKey, legacySaveKey]);
  }

  static saveGame(state: GameSaveState): void {
    writeJson(saveKey, state);
    localStorage.removeItem(oldCausosSaveKey);
    localStorage.removeItem(legacySaveKey);
  }

  static clearGame(): void {
    localStorage.removeItem(saveKey);
    localStorage.removeItem(oldCausosSaveKey);
    localStorage.removeItem(legacySaveKey);
  }

  static loadLearnedCases(): CBRCase[] {
    const cases = readJson<CBRCase[]>(casesKey, [], [oldCausosCasesKey, legacyCasesKey]);
    return Array.isArray(cases) ? cases : [];
  }

  static saveLearnedCases(cases: CBRCase[]): void {
    writeJson(casesKey, cases);
    localStorage.removeItem(oldCausosCasesKey);
    localStorage.removeItem(legacyCasesKey);
  }

  static clearAll(): void {
    localStorage.removeItem(saveKey);
    localStorage.removeItem(casesKey);
    localStorage.removeItem(oldCausosSaveKey);
    localStorage.removeItem(oldCausosCasesKey);
    localStorage.removeItem(legacySaveKey);
    localStorage.removeItem(legacyCasesKey);
  }
}

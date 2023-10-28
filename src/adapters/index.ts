export type Translations = Record<string, string>;

export interface Adapter {
  load(): Promise<Record<string, Translations>>;
  save(translations: Record<string, Translations>): Promise<void>;
}

export type FileMode = "single-file" | "file-per-locale";

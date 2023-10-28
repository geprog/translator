import { Adapter, FileMode, Translations } from ".";

export class JSONAdapter implements Adapter {
  mode: FileMode;

  constructor({ mode }: { mode?: FileMode } = {}) {
    this.mode = mode ?? "file-per-locale";
  }

  async load() {
    // TODO: implement
    return {
      de: {
        "hello.world": "Hallo Welt",
        "not.in.en": "Hallo du bist nicht in en",
        "not.in.en.two": "Hallo du bist nicht in en two",
        "not.in.en.three": "Hallo du bist nicht in en two",
      },
      en: {
        "hello.world": "Hello World",
        "missing.in.de": "Hello you are missing in de",
      },
      es: {
        "hello.world": "Hola Mundo",
      },
    };
  }

  async save(translations: Record<string, Translations>) {
    // TODO: implement
    console.log(translations);
  }
}

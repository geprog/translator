import fs from 'fs/promises';
import path from 'path';
import { Adapter, FileMode, Translations } from '.';

export class JSONAdapter implements Adapter {
  path: string;
  fileExtension = 'json';

  constructor({ path }: { path: string }) {
    this.path = path;
  }

  private async getFileMode(): Promise<FileMode> {
    const stat = await fs.stat(this.path);
    if (stat.isDirectory()) {
      return 'file-per-locale';
    }

    return 'single-file';
  }

  async load() {
    const locales: string[] = [];
    const translations: Record<string, Translations> = {};

    if ((await this.getFileMode()) === 'file-per-locale') {
      const files = await fs.readdir(this.path);
      for await (const file of files) {
        if (!file.startsWith('.') && file.endsWith(`.${this.fileExtension}`)) {
          const locale = file.replace(`.${this.fileExtension}`, '');
          locales.push(locale);
          const content = await fs.readFile(`${this.path}/${file}`, 'utf-8');
          translations[locale] = JSON.parse(content);
        }
      }
    } else {
      const content = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(content);
    }

    return translations;
  }

  async save(translations: Record<string, Translations>) {
    if ((await this.getFileMode()) === 'file-per-locale') {
      for await (const [locale, content] of Object.entries(translations)) {
        await fs.writeFile(path.join(this.path, `${locale}.${this.fileExtension}`), JSON.stringify(content, null, 2));
      }
    } else {
      await fs.writeFile(this.path, JSON.stringify(translations, null, 2));
    }
  }
}

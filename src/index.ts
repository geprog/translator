import { defineCommand, runMain as _runMain } from 'citty';
import { consola } from 'consola';

import { JSONAdapter } from './adapters/json';
import { Adapter } from './adapters';

const main = defineCommand({
  meta: {
    name: 'translator',
    version: '1.0.0',
    description: 'Translate your app',
  },
  subCommands: {
    translate: {
      args: {
        path: {
          type: 'string',
          default: process.cwd(),
          description: 'Path to the translations file or directory',
        },
      },
      meta: {
        name: 'translate',
        description: 'Translate',
      },
      async run({ args }) {
        consola.info('Using @geprog/translator');

        const adapter: Adapter = new JSONAdapter({ path: args.path });

        const translations = await adapter.load();

        const languages = Object.keys(translations);

        const defaultLanguage = 'en'; // TODO: allow to configure

        const notInDefaultLanguage: Record<string, string[]> = {};
        let hasUnusedKeys = false;
        for (const language of languages) {
          if (language === defaultLanguage) {
            continue;
          }

          notInDefaultLanguage[language] = [];

          const languageTranslations = translations[language];

          for (const key of Object.keys(languageTranslations)) {
            if (!translations[defaultLanguage][key]) {
              notInDefaultLanguage[language].push(key);
              hasUnusedKeys = true;
            }
          }
        }

        // ask to cleanup all non-default languages keys that are not present in the default language
        if (hasUnusedKeys) {
          consola.warn(
            `You have the following keys that are not present in the default language:\n${Object.entries(
              notInDefaultLanguage,
            ).reduce((acc, [language, keys]) => {
              if (keys.length === 0) {
                return acc;
              }
              return `${acc}\n[${language}]:\n  ${keys.join('\n  ')}`;
            }, '')}`,
          );

          const shouldCleanup = await consola.prompt(
            'Do you want to remove all unused languages keys that are not present in the default language? (y/n)',
            {
              type: 'confirm',
              required: true,
            },
          );

          if (shouldCleanup) {
            for (const language of Object.keys(notInDefaultLanguage)) {
              for (const key of notInDefaultLanguage[language]) {
                delete translations[language][key];
              }
            }
          }
        }

        consola.debug(translations);

        let translatedTexts = 0;

        // translate all keys that are not present in the non-default languages
        for (const language of languages) {
          if (language === defaultLanguage) {
            continue;
          }

          const languageTranslations = translations[language];

          for (const key of Object.keys(translations[defaultLanguage])) {
            if (!languageTranslations[key]) {
              const newTranslation = await consola.prompt(
                `[${language}] Please enter the translation for "${key}" in "${language}":`,
                {
                  type: 'text',
                  required: true,
                  placeholder: `[${defaultLanguage}]: ${translations[defaultLanguage][key]}`,
                },
              );

              if (!newTranslation) {
                consola.info(`Skipping "${key}" in "${language}"`);
                continue;
              }

              translatedTexts += 1;
              languageTranslations[key] = newTranslation;
            }
          }
        }

        consola.success(`Translated ${translatedTexts} texts`);

        await adapter.save(translations);
      },
    },
  },
});

export const runMain = () => _runMain(main);

import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  rollup: {
    inlineDependencies: true,
    resolve: {
      exportConditions: ['production', 'node'] as any,
    },
    output: {
      sourcemap: true,
    },
  },
  entries: ['src/index'],
});

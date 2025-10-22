const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: {
    '@rentify/db': ['../../packages/db/index.ts'],
    '@rentify/types': ['../../packages/types/index.ts'],
    '@rentify/utils': ['../../packages/utils/index.ts'],
  },
});


import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // aria-query(CJS)의 named export 를 cjs-module-lexer 가 제대로 못 읽어
  // "does not provide an export named 'elementRoles'" 로 깨지는 문제 회피.
  // esbuild 로 다시 프리번들링하도록 강제.
  optimizeDeps: {
    include: ['aria-query', 'lz-string', 'pretty-format'],
  },
  test: {
    // 아직 실제 스토리가 없는 초기 상태에서도 CI가 실패하지 않도록 허용.
    // 스토리가 생기면 그 시점부터 정상적으로 검증이 시작된다.
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

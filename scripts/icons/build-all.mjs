// 5개 아이콘 계열 generated.tsx 를 svg/ 소스로부터 전부 재생성한다.
// 사용법: node scripts/icons/build-all.mjs (또는 npm run icons:build)
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const scripts = [
  'build-icon.mjs',
  'build-logo.mjs',
  'build-tabicon.mjs',
  'build-carouselarrow.mjs',
  'build-graphicicon.mjs',
];

for (const script of scripts) {
  execFileSync('node', [path.join(dir, script)], { stdio: 'inherit' });
}

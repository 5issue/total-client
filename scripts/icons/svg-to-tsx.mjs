// 공용: raw .svg -> (SVGR JSX 변환 + idFor 래핑 + 컬러 토큰 치환) -> render 함수 문자열
import { readFileSync } from 'node:fs';

import { transform } from '@svgr/core';

// 마스크/클립 헬퍼는 bare 키워드(fill="white"/"black")를 쓰고 헥스 리터럴은 쓰지 않는
// 것이 이 저장소의 Figma export 관례라, 헥스 리터럴 치환은 마스킹과 혼동될 위험이 없다.
export const HEX_TO_VAR = {
  '#00c0da': '--color-cyan',
  '#fa622f': '--color-orange',
  '#ffe400': '--color-kakao',
  '#00cb48': '--color-naver',
  '#a500f6': '--color-banner',
  '#93c355': '--color-success',
  '#f0c348': '--color-warning',
  '#fedcd1': '--color-error',
  '#f0f5f7': '--color-info',
  '#690085': '--color-brand-500',
  '#222222': '--color-black',
  '#ffffff': '--color-white',
  '#f7f7f7': '--color-neutral-100',
  '#f0f5f8': '--color-neutral-200',
  '#dde4ed': '--color-neutral-300',
  '#c9d5df': '--color-neutral-400',
  '#b5c4cf': '--color-neutral-500',
  '#a1b3be': '--color-neutral-600',
  '#8aa1ab': '--color-neutral-700',
  '#7e8f9b': '--color-neutral-800',
  '#515e69': '--color-neutral-900',
  '#323a40': '--color-neutral-950',
  '#f8eefb': '--color-brand-50',
  '#edd7f4': '--color-brand-100',
  '#d8a5e9': '--color-brand-200',
  '#c16edd': '--color-brand-300',
  '#a341d1': '--color-brand-400',
  '#50006b': '--color-brand-600',
  '#410057': '--color-brand-700',
  '#320042': '--color-brand-800',
  '#22002e': '--color-brand-900',
  '#12000e': '--color-brand-950',
  '#67bfa4': '--color-cold',
  '#69a3e1': '--color-freeze',
};

export async function svgFileToJsx(svgPath) {
  const raw = readFileSync(svgPath, 'utf8');
  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);
  const widthMatch = raw.match(/\swidth="([\d.]+)"/);
  const heightMatch = raw.match(/\sheight="([\d.]+)"/);
  const viewBox = viewBoxMatch?.[1] ?? `0 0 ${widthMatch?.[1] ?? '0'} ${heightMatch?.[1] ?? '0'}`;

  const code = await transform(
    raw,
    { icon: false, jsxRuntime: 'automatic', svgo: false, plugins: ['@svgr/plugin-jsx'] },
    { componentName: 'X' },
  );

  // `const X = props => <svg ...>{INNER}</svg>;\nexport default X;` 에서 INNER 만 추출
  const openTagEnd = code.indexOf('>', code.indexOf('<svg'));
  const closeTagStart = code.lastIndexOf('</svg>');
  let inner = code.slice(openTagEnd + 1, closeTagStart);

  // {...props} 는 outer <svg> 에만 있어야 하는 SVGR 산출물이라 inner 에는 안 나오지만 방어적으로 제거
  inner = inner.replace(/\{\.\.\.props\}/g, '');

  // id="raw" -> id={idFor('raw')}
  inner = inner.replace(/\bid="([^"]+)"/g, (_, raw2) => `id={idFor('${raw2}')}`);
  // attr="url(#raw)" -> attr={`url(#${idFor('raw')})`}
  inner = inner.replace(/([\w-]+)="url\(#([^)]+)\)"/g, (_, attr, raw2) => {
    return `${attr}={\`url(#\${idFor('${raw2}')})\`}`;
  });

  // 헥스 컬러 -> CSS 변수 치환 (브랜드/시맨틱 고정색만, white/black 키워드는 손대지 않음)
  for (const [hex, varName] of Object.entries(HEX_TO_VAR)) {
    const re = new RegExp(`(fill|stroke)="${hex}"`, 'gi');
    inner = inner.replace(re, `$1="var(${varName})"`);
  }

  // themable: fill/stroke 값이 전부 currentColor 인가 (var()/hex 남아있으면 false)
  const colorValues = [...inner.matchAll(/(?:fill|stroke)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((v) => v !== 'none');
  const themable = colorValues.length > 0 && colorValues.every((v) => v === 'currentColor');

  const hasIdFor = inner.includes("idFor('");

  return { viewBox, inner: inner.trim(), themable, hasIdFor };
}

export function renderFnCode(fnName, jsxResult) {
  const param = jsxResult.hasIdFor ? 'idFor' : '_idFor';
  return `function ${fnName}(${param}: (raw: string) => string): ReactNode {
  return (
    <>
      ${jsxResult.inner}
    </>
  );
}`;
}

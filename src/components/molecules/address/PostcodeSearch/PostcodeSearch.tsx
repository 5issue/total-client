'use client';

import { useEffect, useRef, useState } from 'react';

import Script from 'next/script';

/**
 * 카카오(구 다음) 우편번호 검색 위젯 래퍼 (molecule).
 *
 * 주소 입력 폼을 서드파티 위젯에 위임한다(디자인 없음, 예외 결정 — api-convention §3).
 * 스크립트는 키 불필요·CORS 위젯 내부 처리. `embed` 로 이 컴포넌트 안에 인라인 렌더한다.
 *
 * 스크립트 로드 실패(네트워크·CDN 장애·CSP 차단) 시 빈 컨테이너 대신 안내 + "다시 시도" 를
 * 노출한다 — 실패해도 사용자가 배송지 추가 흐름에 갇히지 않도록.
 *
 * ⚠️ 배포 시: security-convention FE-11 CSP `script-src` 에 `t1.kakaocdn.net` 예외 필요.
 */
const POSTCODE_SCRIPT_SRC = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

export interface PostcodeResult {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  sido: string;
  sigungu: string;
  bname: string;
}

export interface PostcodeSearchProps {
  onComplete: (result: PostcodeResult) => void;
  className?: string;
}

type ScriptStatus = 'loading' | 'ready' | 'error';

export function PostcodeSearch({ onComplete, className }: PostcodeSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embeddedRef = useRef(false);
  // 위젯은 한 번만 embed 하므로 콜백은 ref 로 최신값만 참조한다(effect 재실행 방지).
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const [status, setStatus] = useState<ScriptStatus>(() =>
    typeof window !== 'undefined' && window.daum?.Postcode ? 'ready' : 'loading',
  );
  // 재시도 시 src 에 붙여 next/script 의 로드 캐시를 우회한다.
  const [retry, setRetry] = useState(0);
  const scriptSrc = retry === 0 ? POSTCODE_SCRIPT_SRC : `${POSTCODE_SCRIPT_SRC}?r=${retry}`;

  useEffect(() => {
    const el = containerRef.current;
    if (status !== 'ready' || embeddedRef.current || !el) return;
    const Postcode = window.daum?.Postcode ?? window.kakao?.Postcode;
    if (!Postcode) return;

    // 컨테이너가 실제 높이를 가진 뒤에 embed 한다 — flex-1 로 채우는 경우 첫 렌더엔
    // 높이가 0이라 위젯이 0px 로 그려지고 이후 늘어나도 다시 안 맞는다.
    function embed() {
      if (embeddedRef.current || !el || el.clientHeight === 0) return;
      embeddedRef.current = true;
      new Postcode!({
        oncomplete: (data) => {
          onCompleteRef.current({
            zonecode: data.zonecode,
            roadAddress: data.roadAddress,
            jibunAddress: data.jibunAddress,
            buildingName: data.buildingName,
            sido: data.sido,
            sigungu: data.sigungu,
            bname: data.bname,
          });
        },
        width: '100%',
        height: '100%',
      }).embed(el, { autoClose: false });
    }

    embed();
    if (embeddedRef.current) return;
    const ro = new ResizeObserver(embed);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  return (
    <>
      <Script
        key={retry}
        src={scriptSrc}
        strategy="afterInteractive"
        onReady={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
      {status === 'error' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-body-s text-fg-secondary">
            주소 검색을 불러오지 못했습니다.
            <br />
            네트워크 상태를 확인하고 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => {
              embeddedRef.current = false;
              setStatus('loading');
              setRetry((n) => n + 1);
            }}
            className="text-label-l text-primary border-primary rounded-m inline-flex h-11 items-center border px-4"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div ref={containerRef} className={className} />
      )}
    </>
  );
}

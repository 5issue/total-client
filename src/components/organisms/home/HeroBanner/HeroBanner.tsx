'use client';

import { useEffect, useRef, useState } from 'react';
import type { TouchEvent as ReactTouchEvent } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/atoms/Icon';
import { StatusLabel } from '@/components/molecules/shared/StatusLabel';

/**
 * 홈 히어로 배너 — 프로모션 이미지 + 카피 + 자동재생 토글 + 스와이프 + 페이지네이션 (organism).
 * Figma "HomeScreen" > "Banner Image" (node 577:20652), 402×298.
 *
 * `04 | 30` 은 카운트다운이 아니라 "전체 30개 배너 중 4번째" 형태의 배너 인덱스
 * 카운터다(역질문으로 확인) — `current`/`total` 은 더 이상 props 로 안 받고 `banners`
 * 배열과 내부 `activeIndex` 로부터 계산한다(PR #85 리뷰, seongmin36 — "스와이프 핸들러나
 * 자동 재생 타이머가 들어가야 될 것 같다"). 실제 배너 자산은 1개(`today-deal.webp`)뿐이라
 * `/` 홈 화면은 여전히 배너 1개짜리 배열을 넘긴다 — 스와이프/자동재생 로직 자체는 배너가
 * 여러 개 들어오는 순간 그대로 동작한다(길이 1일 땐 두 기능 다 자동으로 아무 일도
 * 안 한다). Storybook `MultiSlideAutoplay`/`SwipeGesture` 스토리로 다중 배너 동작을 검증한다.
 *
 * - 자동재생 간격은 실제 정책값이 확정 전까지 업계 통상값(4초)을 임시로 쓴다 — 디자인
 *   확정되면 교체.
 * - 스와이프는 `useSwipeTabNavigation`과 같은 네이티브 터치 이벤트 + delta 임계값 패턴을
 *   따르되(서드파티 제스처 라이브러리 없음, code-style §8), 탭 전환처럼 끝에서 멈추지 않고
 *   순환(마지막 다음은 처음으로)한다 — 배너 캐러셀의 일반적인 기대 동작.
 * - `SwipeTabShell`의 전역 좌우 스와이프(탭 전환)와 겹치는 영역이라 `stopPropagation`
 *   필수(그 컴포넌트 문서 주석이 명시한 정확히 그 경고 케이스) — 없으면 배너를 넘기려는
 *   제스처가 홈→라운지 탭 전환으로 새버린다.
 *
 * 재생/일시정지 버튼: 디자인 시스템에 Pause 아이콘만 있고 Play 아이콘이 없다
 * (`search_design_system` 확인, 0건) — 아이콘 글리프는 고정하고 `aria-pressed`/
 * `aria-label` 로만 상태를 알린다(아이콘 추가는 후속). "광고" 뱃지는
 * `molecules/shared/StatusLabel`(`type="adLabelS"`)을 그대로 재사용한다.
 *
 * `imageSrc` 미지정 시 회색 박스로 대체한다(퍼블리싱 단계 관례, `CartLineItem` 참고).
 *
 * `quality={90}`(기본 75보다 높임, PR #85 리뷰 — "이미지가 뿌옇게 보인다") — 실제 원인은
 * 소스 자산(900×672)이 3배율 기기의 이상적 해상도(402px 표시 × 3 = 1206px)에는 못 미쳐
 * next/image 가 원본 폭 이상으로 업스케일할 수 없는 것과, 기본 quality=75 압축이 겹친
 * 것이다. quality 상향으로 압축 열화는 줄이지만 원본 해상도 자체를 늘리려면 디자인팀에서
 * 더 큰 원본을 받아야 한다(Figma 코멘트로 요청 필요, 이 세션에서는 자산 자체를 만들 수
 * 없어 코드로 할 수 있는 부분만 반영).
 *
 * 재생/일시정지 버튼과 전체보기 링크는 Figma 실측 그대로 28px(size-7/h-7)를 유지하되,
 * `QuantityStepper`(node 2429-3870)와 같은 `::before` 확장 영역으로 터치 타깃만 44px로
 * 넓힌다 — 시각 크기는 그대로, 히트 영역만 넓히는 프로젝트 공통 패턴.
 */
export type HeroBannerSlide = {
  imageSrc?: string;
  imageAlt: string;
  /** 상단 얇은 카피 한 줄(예: "오늘만이 가격"). */
  eyebrow: string;
  /** 상단 굵은 카피 한 줄(예: "지금 반값세일 중"). */
  title: string;
  description: string;
  /** "전체보기" 및 페이지네이션 링크 목적지. */
  href: string;
};

export type HeroBannerProps = {
  banners: HeroBannerSlide[];
  className?: string;
};

const AUTOPLAY_INTERVAL_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

export function HeroBanner({ banners, className }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const total = banners.length;
  // 배너 개수가 바뀌어도(스토리 args 변경 등) 범위 밖 인덱스를 가리키지 않게 방어.
  const clampedIndex = total > 0 ? activeIndex % total : 0;
  const slide = banners[clampedIndex];

  useEffect(() => {
    if (!playing || total <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing, total]);

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null || startY === null || total <= 1) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const endY = event.changedTouches[0]?.clientY ?? startY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    setActiveIndex((prev) => (deltaX < 0 ? (prev + 1) % total : (prev - 1 + total) % total));
  }

  function handleTouchCancel(event: ReactTouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    touchStartX.current = null;
    touchStartY.current = null;
  }

  if (!slide) return null;

  return (
    <div
      className={['aspect-hero-banner relative w-full overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {slide.imageSrc ? (
        <Image
          key={slide.imageSrc}
          src={slide.imageSrc}
          alt={slide.imageAlt}
          fill
          preload
          quality={90}
          sizes="(max-width: 480px) 100vw, 402px"
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="bg-surface-secondary absolute inset-0" />
      )}

      <div className="text-fg relative flex flex-col gap-1 px-6 pt-6">
        <p className="text-display-m">{slide.eyebrow}</p>
        <p className="text-display-l">{slide.title}</p>
        <p className="text-body-s mt-2">{slide.description}</p>
      </div>

      <div className="absolute right-3 bottom-3 flex flex-col items-end gap-3">
        <StatusLabel type="adLabelS">광고</StatusLabel>

        <div className="flex items-center gap-1">
          {/* 배너가 1개뿐이어도 버튼은 그대로 둔다(Figma 30장 목업 기준 스펙) — 자동재생
              자체가 total<=1 이면 위 effect 에서 이미 무동작이라 토글해도 시각 변화가
              없을 뿐, 버튼을 숨기는 건 Figma에 없는 자체 판단이라 하지 않는다. */}
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            aria-pressed={playing}
            aria-label={playing ? '배너 자동 재생 일시정지' : '배너 자동 재생 시작'}
            className="bg-overlay relative flex size-7 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-2 before:content-['']"
          >
            <Icon name="pause" size={20} aria-hidden />
          </button>

          <Link
            href={slide.href}
            aria-label={`전체보기, 현재 ${clampedIndex + 1} / 전체 ${total}`}
            className="bg-overlay text-fg-inverse text-caption-m relative inline-flex h-7 items-center gap-1 rounded-full px-2 whitespace-nowrap before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']"
          >
            <span className="flex items-center gap-0.5">
              <span>{String(clampedIndex + 1).padStart(2, '0')}</span>
              <span aria-hidden className="h-2 w-px bg-white/60" />
              <span className="text-fg-quaternary">{total}</span>
            </span>
            전체보기
            <Icon name="right-small" size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

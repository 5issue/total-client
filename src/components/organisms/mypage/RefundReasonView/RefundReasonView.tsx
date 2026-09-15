'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Radio } from '@/components/atoms/Radio';
import { Textarea } from '@/components/atoms/Textarea';
import { BottomSheet } from '@/components/molecules/shared/BottomSheet';
import {
  SectionHeader,
  type SectionHeaderAction,
} from '@/components/organisms/shared/SectionHeader';

import { MOCK_REFUND_REASON_ITEMS, REFUND_REASON_OPTIONS } from './mock';
import type { RefundReasonItemInput } from './model';

/**
 * 반품 사유 화면 (organism).
 * Figma 666-29306(선택 전) / 666-29905(시트) / 666-29703(사유 선택 후, 상세 미입력) /
 * 666-29751(사진 안내 툴팁) / 666-29851(상세 사유 250자 + 사진 1장 + CTA 활성) /
 * 848-82875(반품 항목 2건 이상 — 각 항목마다 독립된 사유 드롭다운).
 *
 * 본문 폭 370(`mx-4`), 헤더↔본문 `mt-7`. 항목이 여럿이면 항목 그룹 사이 `gap-8`(32px,
 * node 848-82875 `gap/xxxl`), 그룹 내부(상품 요약 ↔ 사유 영역) `gap-4`(기존과 동일) —
 * "반품 항목이 여러 개면 사유도 각각 무조건 있어야 한다"(2026-09-15 요구사항)에 따라
 * `/mypage/orders/return` 에서 체크한 상품 각각이 독립적으로 사유·상세 사유·사진을
 * 갖는다. 사유를 고르면(단순변심 제외) 그 상품에 한해 상세 사유 입력(`Textarea`,
 * 10~250자)과 사진 추가(최대 3장, 최소 1장)가 나타난다 — `다음`은 "모든 상품이 각각
 * 사유 선택 + 상세 사유 10자 이상 + 사진 1장 이상"을 만족해야 활성화된다
 * (node 666-29851: 250/250 + 사진 1장 상태에서만 CTA가 검정 활성. 항목이 여럿이면
 * 그 조건을 각 항목에 반복 적용). 상세 사유는 입력을 시작했는데 아직 10자 미만이면
 * `Textarea` 의 `error` 슬롯(`role="alert"`, `text-fg-danger`)에 "최소 10자 이상
 * 입력해주세요"를 보여준다 — 빈 칸일 때는(아직 시작 전) 표시하지 않는다.
 * 라디오는 미선택/비활성일 땐 "Radio_Purple" 컴포넌트를 쓰지만(둘 다 회색 윤곽만 노출돼
 * 실제로 퍼플이 보이진 않는다), 체크 순간엔 완전히 다른 컴포넌트로 바뀐다 — node 666-30033
 * (선택 후 시트, "상품불량" 체크)에서 확인: 그 노드의 선택 라디오는 이름이 그냥 "Radio"
 * (754-60641)이고 렌더은 검정 두꺼운 링이다, 퍼플이 아니다. 그래서 `tone="black"`.
 * 시트 제목 40px 행 다음 목록까지 20px. 시트 하나를 모든 항목이 공유하고, 열 때
 * `openItemId` 로 어느 항목의 사유를 고르는 중인지 추적한다.
 * 헤더 우측 홈 아이콘 → `/` (Figma node 789-63745 TopNavigationBar, 모든 하위 화면 공통).
 *
 * 하단 CTA(`HorizontalCtaBar`, node 666-29801/666-29904)는 상세 사유·사진이 늘어나면
 * 본문이 뷰포트보다 길어질 수 있어 `sticky bottom-0` — CheckoutView 의 결제 CTA 바와
 * 동일 패턴(둘 다 크롬리스 풀스크린 뷰, 문서 자체가 스크롤된다).
 * [다음] 활성화 후 클릭하면 `/mypage/orders/return/detail`(반품 내역 상세, node 795-64058)로
 * 이동한다.
 */
export interface RefundReasonViewProps {
  /** `/mypage/orders/return` 에서 체크한 상품들. 생략 시 목데이터 1건으로 폴백(직접 진입·스토리북). */
  items?: RefundReasonItemInput[];
  /** 스토리용 — 첫 번째 상품의 사유 초기값. */
  defaultReasonId?: string | null;
  /** 스토리용 — 첫 번째 상품의 사유 선택 시트를 열어둔 채 시작. */
  defaultSheetOpen?: boolean;
}

/** 원 단위 금액 표시. */
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

const MIN_DETAIL_LENGTH = 10;
const MAX_DETAIL_LENGTH = 250;
const MAX_PHOTOS = 3;

const HEADER_ACTIONS: SectionHeaderAction[] = [{ icon: 'home', label: '홈으로 이동', href: '/' }];

interface ItemDraft {
  reasonId: string | null;
  detail: string;
  photos: string[];
  photoHintDismissed: boolean;
}

/** 상품별 사유 입력 초안. */
function createDraft(reasonId: string | null = null): ItemDraft {
  return { reasonId, detail: '', photos: [], photoHintDismissed: false };
}

/** 선택 가능한 사유만 반환한다. 비활성(단순변심 등)은 제외. */
function getSelectedReason(draft: ItemDraft | undefined) {
  return REFUND_REASON_OPTIONS.find((o) => o.id === draft?.reasonId && !o.disabled);
}

export function RefundReasonView({
  items = MOCK_REFUND_REASON_ITEMS,
  defaultReasonId = null,
  defaultSheetOpen = false,
}: RefundReasonViewProps) {
  const router = useRouter();
  const firstItemId = items[0]?.id;

  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>(() =>
    Object.fromEntries(
      items.map((item) => [item.id, createDraft(item.id === firstItemId ? defaultReasonId : null)]),
    ),
  );
  const [openItemId, setOpenItemId] = useState<string | null>(
    defaultSheetOpen ? (firstItemId ?? null) : null,
  );

  // 사진 업로드(node 666-29897/666-29851) — 백엔드 미연동이라 업로드 API 없이 로컬
  // blob URL 미리보기만 관리한다(체크아웃 화면들과 같은 목데이터 단계 원칙). 입력창은
  // 항목 수와 무관하게 하나를 공유하고, 버튼을 누른 항목 id 는 input `data-item-id` 에
  // 동기적으로 붙인다. state 로 두면 파일 선택 change 가 같은 틱에 올 때 빈 id 로
  // 업로드가 버려진다.
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 언마운트 시에만 남은 blob URL을 정리한다 — `drafts` 를 직접 이펙트 의존성으로 두면
  // 바뀔 때마다(사진 추가 포함) 클린업이 먼저 돌아 방금 만든 URL까지 해제해버린다.
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  });
  useEffect(() => {
    return () => {
      Object.values(draftsRef.current).forEach((draft) =>
        draft.photos.forEach((url) => URL.revokeObjectURL(url)),
      );
    };
  }, []);

  const canNext =
    items.length > 0 &&
    items.every((item) => {
      const draft = drafts[item.id];
      return (
        Boolean(getSelectedReason(draft)) &&
        (draft?.detail.trim().length ?? 0) >= MIN_DETAIL_LENGTH &&
        (draft?.photos.length ?? 0) >= 1
      );
    });

  function updateDraft(itemId: string, patch: Partial<ItemDraft>) {
    setDrafts((prev) => {
      const current = prev[itemId] ?? createDraft();
      return { ...prev, [itemId]: { ...current, ...patch } };
    });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const itemId = e.currentTarget.dataset.itemId;
    e.target.value = ''; // 같은 파일을 연속으로 선택해도 change 가 다시 발생하도록
    if (!file || !itemId) return;
    setDrafts((prev) => {
      const current = prev[itemId] ?? createDraft();
      if (current.photos.length >= MAX_PHOTOS) return prev;
      return {
        ...prev,
        [itemId]: { ...current, photos: [...current.photos, URL.createObjectURL(file)] },
      };
    });
  }

  function handleRemovePhoto(itemId: string, url: string) {
    setDrafts((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return { ...prev, [itemId]: { ...current, photos: current.photos.filter((p) => p !== url) } };
    });
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <SectionHeader
        leading="back"
        onLeadingClick={() => router.back()}
        title="반품사유"
        actions={HEADER_ACTIONS}
      />

      <div className="bg-surface flex min-h-0 flex-1 flex-col">
        <div className="mx-4 mt-7 flex flex-col gap-8">
          {items.map((item) => {
            const draft = drafts[item.id];
            const selected = getSelectedReason(draft);
            const showPhotoHint = !draft?.photoHintDismissed && draft?.photos.length === 0;

            return (
              <div key={item.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div aria-hidden className="bg-surface-secondary size-14 shrink-0 rounded-sm" />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                    <p className="text-heading-5 text-fg truncate">{item.name}</p>
                    <div className="text-heading-5 text-fg-tertiary flex items-center gap-1">
                      <span>{item.quantity}개</span>
                      <span aria-hidden className="bg-border h-3 w-px shrink-0" />
                      <span>{won(item.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={openItemId === item.id}
                    onClick={() => setOpenItemId(item.id)}
                    className="border-border flex h-12.5 w-full items-center justify-between rounded-sm border py-1 pr-3 pl-4"
                  >
                    <span
                      className={
                        selected ? 'text-heading-5 text-fg' : 'text-heading-5 text-fg-quaternary'
                      }
                    >
                      {selected ? selected.label : '반품 사유를 선택해주세요'}
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center">
                      <Icon name="arrow-down" size={28} aria-hidden />
                    </span>
                  </button>

                  {selected ? (
                    <>
                      <Textarea
                        label="반품 상세 사유"
                        placeholder="상세 사유를 입력해주세요"
                        rows={4}
                        maxLength={MAX_DETAIL_LENGTH}
                        value={draft?.detail ?? ''}
                        onChange={(e) => updateDraft(item.id, { detail: e.target.value })}
                        error={
                          (draft?.detail.length ?? 0) > 0 &&
                          (draft?.detail.trim().length ?? 0) < MIN_DETAIL_LENGTH
                            ? `최소 ${MIN_DETAIL_LENGTH}자 이상 입력해주세요`
                            : undefined
                        }
                      />

                      <div className="flex items-center gap-3">
                        {draft?.photos.map((url) => (
                          <div
                            key={url}
                            className="relative flex size-18 shrink-0 items-start justify-end"
                          >
                            {/* 로컬에서 방금 고른 파일의 blob 미리보기다 — next/image 기본 로더는
                                blob: URL 을 최적화할 수 없어 `unoptimized` 로 렌더만 위임한다. */}
                            <Image
                              src={url}
                              alt="첨부한 반품 사진"
                              fill
                              unoptimized
                              sizes="72px"
                              className="rounded-sm object-cover"
                            />
                            <button
                              type="button"
                              aria-label="사진 삭제"
                              onClick={() => handleRemovePhoto(item.id, url)}
                              className="relative flex size-11 items-start justify-end p-1"
                            >
                              <Icon name="close-circle" size={20} aria-hidden />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          aria-label="사진 추가 (최대 3장)"
                          disabled={(draft?.photos.length ?? 0) >= MAX_PHOTOS}
                          onClick={() => {
                            const input = fileInputRef.current;
                            if (!input) return;
                            input.dataset.itemId = item.id;
                            input.click();
                          }}
                          className="border-border rounded-m flex size-18 shrink-0 items-center justify-center border disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon name="camera" size={28} aria-hidden />
                        </button>

                        {showPhotoHint ? (
                          <div className="flex items-stretch">
                            <span
                              aria-hidden
                              className="border-r-fg flex shrink-0 items-center self-center border-y-[5px] border-r-8 border-y-transparent"
                            />
                            <div className="rounded-m bg-fg flex items-start gap-2 py-2 pr-2 pl-3">
                              <p className="text-label-xs text-fg-inverse">
                                빠른 처리를 위해 사진을 등록해주세요
                                <br />
                                (최대 3장)
                              </p>
                              <button
                                type="button"
                                aria-label="사진 등록 안내 닫기"
                                onClick={() => updateDraft(item.id, { photoHintDismissed: true })}
                                className="-my-2 -mr-2 flex size-11 shrink-0 items-center justify-center"
                              >
                                <Icon
                                  name="close"
                                  size={20}
                                  className="text-fg-inverse"
                                  aria-hidden
                                />
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* capture="environment": 모바일에서 탭하면 갤러리가 아니라 카메라 앱(후면)이
            바로 뜬다. 데스크톱은 지원 브라우저면 웹캠, 아니면 일반 파일 선택으로 폴백.
            모든 항목의 "사진 추가" 버튼이 이 입력창 하나를 공유한다(data-item-id). */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />

        <div className="bg-surface sticky bottom-0 mt-auto px-4 py-3">
          <Button
            variant="black"
            size="l"
            disabled={!canNext}
            className="h-14 w-full"
            onClick={() => router.push('/mypage/orders/return/detail')}
          >
            다음
          </Button>
        </div>
      </div>

      <BottomSheet
        open={openItemId !== null}
        onClose={() => setOpenItemId(null)}
        ariaLabel="반품 사유를 선택해주세요"
      >
        <div className="flex flex-col">
          <h2 className="text-heading-2 text-fg flex h-10 items-center px-4">
            반품 사유를 선택해주세요
          </h2>
          <fieldset className="mt-5 flex flex-col gap-3 pb-4">
            <legend className="sr-only">반품 사유</legend>
            {REFUND_REASON_OPTIONS.map((option) => {
              const inputId = `refund-reason-${openItemId}-${option.id}`;
              return (
                <div key={option.id} className="flex h-10 items-center gap-0.5 px-4">
                  <Radio
                    id={inputId}
                    tone="black"
                    name={`refund-reason-${openItemId}`}
                    value={option.id}
                    label={option.label}
                    disabled={option.disabled}
                    checked={openItemId ? drafts[openItemId]?.reasonId === option.id : false}
                    className="size-10"
                    onChange={() => {
                      if (option.disabled || !openItemId) return;
                      updateDraft(openItemId, { reasonId: option.id });
                    }}
                  />
                  <label
                    htmlFor={inputId}
                    aria-hidden
                    className={
                      option.disabled
                        ? 'text-heading-2 text-fg-disabled cursor-not-allowed'
                        : 'text-heading-2 text-fg cursor-pointer'
                    }
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </fieldset>
        </div>
      </BottomSheet>
    </>
  );
}

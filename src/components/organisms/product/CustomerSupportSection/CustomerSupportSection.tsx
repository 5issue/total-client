import { PolicyAccordion } from '@/components/molecules/shared/PolicyAccordion';

/**
 * 상세정보 탭 하단 — 고객행복센터 안내 + 문의 채널 + 교환/반품 정책 아코디언 +
 * 주문취소/배송 안내 (organism). Figma "5팀 UI 공유용" `Frame 2117906355`
 * (node 665:43726/43794) — 상품과 무관한 사이트 공통 정책 텍스트라 mock prop 없이
 * 하드코딩(다른 정적 고지 문구 — AddToCartActions 약관 문구 — 와 같은 원칙).
 *
 * "자세히 보기"(주문 취소 상세) 펼침 콘텐츠는 Figma "5팀 디자인 시스템"
 * `AccordionContent`/`Cancel_Refund_Policy`(node 3215:3809) 실측 — 주문 취소 관련 /
 * 결제 승인 취소·환불 관련 두 그룹의 불릿 목록을 그대로 반영.
 */
export function CustomerSupportSection() {
  return (
    <div className="bg-surface flex w-full flex-col items-center gap-8 pt-8">
      <div className="text-fg-secondary flex w-full flex-col items-center gap-3 text-center">
        {/* Figma: Heading/H5_Medium(16/500) — heading-4 는 600(SemiBold)이라 더 굵다 */}
        <p className="text-heading-5">고객행복센터</p>
        <p className="text-label-xs">궁금하신 점이나 서비스 이용에 불편한 점이 있으신가요?</p>
        <div className="border-border w-67.5 border-t" />
        <p className="text-label-xs w-61 text-center">
          문제가 되는 부분을 사진으로 찍어
          <br />
          아래 중 편하신 방법으로 접수해 주시면
          <br />
          빠르게 도와드리겠습니다.
        </p>
        <div className="border-border w-67.5 border-t" />
      </div>

      <div className="flex w-full flex-col items-center gap-1 py-4">
        <p className="text-heading-5 text-primary">전화 문의 1644-1107</p>
        <p className="text-label-xs">월~토요일 오전 7시 - 오후 6시</p>
      </div>

      <div className="flex w-full flex-col items-center gap-1 pb-4">
        <div className="flex w-full flex-col items-center gap-1 py-4">
          <p className="text-heading-5 text-primary">카카오톡 문의</p>
          <p className="text-label-xs text-center">
            월~토요일 오전 7시 - 오후 6시
            <br />
            일/공휴일 오전 7시 - 오후 1시
          </p>
        </div>
        <p className="text-caption-m text-fg-tertiary text-center">
          {`※ 카카오톡에서 '컬리'를 검색 후`}
          <br />
          대화창에 문의 및 불편사항을 남겨주세요.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-1 pb-4">
        <div className="flex w-full flex-col items-center gap-1 py-4">
          <p className="text-heading-5 text-primary">홈페이지 문의</p>
          <p className="text-label-xs text-center">
            365일
            <br />
            {'로그인 > 마이컬리 > 1:1 문의'}
          </p>
        </div>
        <p className="text-caption-m text-fg-tertiary">
          ※ 고객센터 운영 시간에 순차적으로 답변해드리겠습니다.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-1 py-4">
        <p className="text-heading-5 text-primary">교환 및 환불 안내</p>
        <p className="text-label-xs text-center">
          {'교환 및 환불이 필요하신 경우 [마이컬리 > 주문내역]에서'}
          <br />
          직접 반품 접수하거나 고객행복센터로 문의해 주시기 바랍니다.
          <br />
          아래 항목을 누르면 자세한 정책을 보실 수 있습니다.
        </p>
      </div>

      <div className="flex w-full flex-col items-start">
        <PolicyAccordion title="01. 상품에 문제가 있는 경우">
          <p>
            받으신 상품이 표시·광고 내용 또는 계약 내용과
            <br />
            다른 경우에는 상품을 받은 날부터 3개월 이내,
            <br />
            그 사실을 알게 된 날부터 30일 이내에
            <br />
            반품을 요청하실 수 있습니다.
            <br />
            고객행복센터로 문의해 주시기 바랍니다.
          </p>
          <p>
            상품의 정확한 상태를 확인할 수 있도록
            <br />
            사진을 함께 보내주시면 더 빠른 상담이 가능합니다.
          </p>
          <p>※ 배송 상품에 문제가 있는 것으로 확인되면 배송비는 판매자가 부담합니다.</p>
        </PolicyAccordion>
        <PolicyAccordion title="02. 단순 변심, 주문 착오의 경우">
          <div className="flex flex-col items-center gap-2">
            <p className="text-label-l text-primary">신선/냉장/냉동 식품</p>
            <p>
              상품의 특성상 재판매가 불가하여
              <br />
              단순 변심, 주문 착오, 주소 오입력 등
              <br />
              고객의 책임 있는 사유로 인한 교환 및 반품이 어려운 점
              <br />
              양해 부탁드립니다.
            </p>
            <p>
              상품에 따라 조금씩 맛이 다를 수 있으며,
              <br />
              개인의 기호에 따라 같은 상품도 다르게 느끼실 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-label-l text-primary">
              유통기한 30일 이상 식품
              <br />
              (신선 / 냉장 / 냉동 제외) & 기타 상품 (뷰티 제품, 생활용품)
            </p>
            <p>
              상품을 받은 날부터 7일 이내 반품 접수가 가능합니다.
              <br />
              직접 접수하시거나 고객행복센터로 문의해 주시기 바랍니다.
            </p>
          </div>
          <p className="text-fg-secondary">
            ※ 단순 변심, 주문 착오, 주소 오입력 등 고객의 책임 있는 사유로 인한 교환 및 반품의 경우
            고객님께서 왕복배송비 6,000원(배송비를 낸 경우 3,000원)을 부담하셔야 합니다.
          </p>
        </PolicyAccordion>
        <PolicyAccordion title="03. 교환·환불이 불가한 경우">
          <div className="flex flex-col items-center gap-2">
            <p className="text-label-l text-primary">신선/냉장/냉동 식품</p>
            <p>
              다음에도 해당하는 교환·환불 신청은
              <br />
              처리가 어려울 수 있으니 양해 부탁드립니다.
            </p>
          </div>
          <ul className="list-disc space-y-3 self-start pl-5 text-left">
            <li>
              고객님의 책임 있는 사유로 상품이 멸실되거나 훼손된 경우
              <br />
              (단, 상품의 내용을 확인하기 위해 포장 등을 훼손한 경우는 제외)
            </li>
            <li>고객님의 사용 또는 일부 소비로 상품의 가치가 감소한 경우</li>
            <li>시간이 지나 다시 판매하기 곤란할 정도로 상품의 가치가 감소한 경우</li>
            <li>복제가 가능한 상품의 포장이 훼손된 경우</li>
            <li>고객님의 주문에 따라 개별적으로 생산되는 상품의 제작이 이미 진행된 경우</li>
            <li>반품 신청 후 14일 내에 물품이 반환되지 않고 고객님과 연락이 되지 않는 경우</li>
          </ul>
        </PolicyAccordion>
      </div>

      <div className="flex w-full flex-col items-center gap-3 py-8 text-center">
        <p className="text-heading-1 text-fg-secondary">주문 취소 안내</p>
        <p className="text-label-xs text-fg-secondary">
          {'[마이컬리 > 주문내역]에서 직접 취소하실 수 있습니다.'}
        </p>
      </div>
      <div className="flex w-full flex-col items-start">
        <PolicyAccordion title="자세히 보기">
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-label-l text-primary">주문 취소 관련</p>
            <ul className="flex w-full list-inside list-disc flex-col gap-3">
              <li>{'주문취소는 [마이컬리>주문내역]에서 직접 하실 수 있습니다.'}</li>
              <li>
                [배송중]부터는 배송이 시작되어 주문 취소가 불가하니, 반품 접수 부탁드립니다(상품에
                따라 반품이 불가할 수 있습니다).
              </li>
              <li>
                주문취소 및 반품 접수와 관련하여 도움이 필요하신 경우 고객행복센터로 문의해 주시기
                바랍니다.
              </li>
              <li>주문마감 시간에 임박할수록 취소 가능 시간이 짧아질 수 있습니다.</li>
              <li>일부 예약상품은 판매 시 안내된 취소 마감 기한 내에만 취소할 수 있습니다.</li>
              <li>파트너사 판매상품의 경우, 파트너사의 정책에 따라 주문취소가 가능합니다.</li>
              <li>미성년자 결제 시 법정대리인이 그 거래를 취소할 수 있습니다.</li>
            </ul>
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-label-l text-primary">결제 승인 취소 / 환불 관련</p>
            <ul className="flex w-full list-inside list-disc flex-col gap-3">
              <li>카드 환불은 카드사 정책에 따르며, 자세한 사항은 카드사에 문의해주세요.</li>
              <li>결제 취소 시, 사용하신 적립금과 쿠폰도 모두 복원됩니다.</li>
              <li>고객님의 사용 또는 일부 소비로 상품의 가치가 감소한 경우</li>
              <li>시간이 지나 다시 판매하기 곤란할 정도로 상품의 가치가 감소한 경우</li>
              <li>복제가 가능한 상품의 포장이 훼손된 경우</li>
              <li>고객님의 주문에 따라 개별적으로 생산되는 상품의 제작이 이미 진행된 경우</li>
              <li>반품 신청 후 14일 내에 물품이 반환되지 않고 고객님과 연락이 되지 않는 경우</li>
            </ul>
          </div>
        </PolicyAccordion>
      </div>

      {/* node 665:43752 실측 재확인 — 가운데 정렬 + text/secondary 였는데 처음에
          왼쪽정렬·text-fg(primary)로 잘못 넣었었다. */}
      <div className="text-fg-secondary flex w-full flex-col items-center gap-3 px-4 py-8 text-center">
        <p className="text-heading-1">배송관련 안내</p>
        <p className="text-label-xs">
          배송 과정 중 기상 악화 및 도로교통 상황에 따라
          <br />
          부득이하게 지연 배송이 발생될 수 있습니다.
        </p>
      </div>
    </div>
  );
}

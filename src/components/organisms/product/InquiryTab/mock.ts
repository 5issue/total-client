/**
 * "문의" 탭 목 데이터. Figma "5팀 UI 공유용" node 665:43879(기본 목록) — 비밀글 6건 +
 * 공개글("본인이 작성했거나 공개된 문의글", 사용자 확인 2026-09-16) 1건("터져서
 * 왔어요", node 665:43824 에서 질문/답변 본문 실측). 비밀글은 Figma 상 6건 모두 동일한
 * 더미 내용(답변완료 | 최*라 | 2026.04.28)이라 그대로 반복했다.
 */
export type InquiryEntry =
  | {
      locked: true;
      answerLabel: string;
      author: string;
      date: string;
    }
  | {
      locked: false;
      title: string;
      answerLabel: string;
      author: string;
      date: string;
      question: string[];
      answer: string[];
    };

const LOCKED_ENTRY = {
  locked: true as const,
  answerLabel: '답변완료',
  author: '최*라',
  date: '2026.04.28',
};

export const MOCK_INQUIRIES: InquiryEntry[] = [
  LOCKED_ENTRY,
  {
    locked: false,
    title: '터져서 왔어요',
    answerLabel: '답변완료',
    author: '최*라',
    date: '2026.04.28',
    question: [
      '우유가 터져서 왔네요',
      '더운 날씨에 너무 너무 수고하시고 힘드신거 아는데 그래도 조금만 더 신경 써 주시면 감사하겠습니다',
      '수고하십시오',
    ],
    answer: [
      '안녕하세요 고객님',
      '컬리를 믿고 상품 구매해 주셨을텐데요.',
      '좋지 못한 경험을 안겨 드리게 되어 정말 죄송합니다.',
      '',
      '해당 게시판은 상품에 대한 문의를 남겨주시는 공간으로, 자세한 확인과 상담을 포함한 조치가 필요한 건에 대해서는 본 게시판에서는 답변 및 조치가 어려워 번거로우시더라도 고객행복센터로 문의 하신다면 전문 상담사가 해당 내용을 확인 후 신속하게 답변을 드리도록 하겠습니다.',
      '',
      '[상담 업무 시간] 고객행복센터 (☎ 1644-1107) - 평일, 토요일 오전 7시 ~ 오후 6시 ',
      '카카오톡 - 평일, 토요일 오전 7시 ~ 오후 6시 ',
      '일요일, 공휴일 오전 7시 ~ 오후 1시',
      '1:1 문의 - 365일 접수 가능, 고객센터 운영시간 순차 안내',
      '',
      '다시 한 번 이용에 불편을 드리게 되어 죄송한 마음 전하오며',
      '추후 보다 면밀히 살펴 고객님께 안전하고 만족스러운 상품을 제공하고자 더욱 더 최선을 다하는 컬리가 되겠습니다.',
      '',
      '감사합니다.',
      'Better Life for All. Kurly',
    ],
  },
  LOCKED_ENTRY,
  LOCKED_ENTRY,
  LOCKED_ENTRY,
  LOCKED_ENTRY,
  LOCKED_ENTRY,
];

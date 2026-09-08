import { Badge, type BadgeProps } from '@/components/atoms/Badge/Badge';

/**
 * 리뷰 작성자 이름 옆에 붙는 뱃지 표기 (Figma "Tag_Badge", node 3235-4384(Badge/베스트),
 * 3235-4385(Badge/멤버스), 3235-4386(Username)). 세 노드의 x 간격이 전부 gap/2xs(4px)로
 * 일정해 한 행에 같이 쓰인다고 보고, 새 시각 스타일 없이 atoms/Badge + 유저네임 텍스트를
 * 조합만 한다 — 실제로 항상 같이 쓰이는지는 Figma 캔버스에서 재확인 필요(가정).
 *
 * badge 를 BadgeProps 그대로 받는다 — Pick 으로 color/size 만 추리면 purple+large 차단용
 * discriminated union 이 풀려버려서(Pick 은 유니온에 분배되지 않는다) 타입 안전성이 깨진다.
 */
export interface ReviewerBadgeProps {
  /** 생략하면 뱃지 없이 유저네임만 렌더한다. */
  badge?: BadgeProps;
  username: string;
  className?: string;
}

export function ReviewerBadge({ badge, username, className }: ReviewerBadgeProps) {
  return (
    <span className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}>
      {badge ? <Badge {...badge} /> : null}
      <span className="text-label-m text-fg">{username}</span>
    </span>
  );
}

import { Badge, type BadgeProps } from '@/components/atoms/Badge/Badge';

/**
 * 리뷰 작성자 이름 옆에 붙는 뱃지 표기 (Figma "Tag_Badge", node 3235-4384(Badge/베스트),
 * 3235-4385(Badge/멤버스), 3235-4386(Username)). 세 노드의 x 간격이 전부 gap/2xs(4px)로
 * 일정해 한 행에 같이 쓰인다고 보고, 새 시각 스타일 없이 atoms/Badge + 유저네임 텍스트를
 * 조합만 한다 — 후기 탭 `TagGroup`(node 665:43657, 665:42470)에서 베스트+멤버스 두
 * 뱃지가 실제로 한 행에 같이 쓰이는 걸 확인해 `badges` 배열로 일반화했다.
 *
 * BadgeProps 를 배열 원소 그대로 받는다 — Pick 으로 color/size 만 추리면 purple+large
 * 차단용 discriminated union 이 풀려버려서(Pick 은 유니온에 분배되지 않는다) 타입
 * 안전성이 깨진다.
 */
export interface ReviewerBadgeProps {
  /** 생략하면 뱃지 없이 유저네임만 렌더한다. 여러 개면 Figma "TagGroup" 순서대로 나란히. */
  badges?: BadgeProps[];
  username: string;
  className?: string;
}

export function ReviewerBadge({ badges = [], username, className }: ReviewerBadgeProps) {
  return (
    <span className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}>
      {badges.map((badge, i) => (
        <Badge key={i} {...badge} />
      ))}
      <span className="text-label-m text-fg">{username}</span>
    </span>
  );
}

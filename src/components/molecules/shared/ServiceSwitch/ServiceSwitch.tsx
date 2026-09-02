'use client';

/**
 * 헤더 서비스 전환 알약형 스위처 (Figma "Header_Service", 예: 마켓컬리/뷰티컬리).
 * TabBar 와 같은 "선택 가능한 탭" 패턴이지만 시각 언어가 달라(배경 알약 slide,
 * 밑줄 없음) 별도 컴포넌트로 분리했다. 옵션 2개 고정 — 3개 이상이 필요해지면
 * TabBar(fitted) 로 전환을 검토한다.
 */
export type ServiceSwitchOption = {
  id: string;
  label: string;
};

export type ServiceSwitchProps = {
  options: [ServiceSwitchOption, ServiceSwitchOption];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function ServiceSwitch({ options, activeId, onChange, className }: ServiceSwitchProps) {
  return (
    <div
      role="tablist"
      className={`bg-brand-200 inline-flex overflow-hidden rounded-full ${className ?? ''}`.trim()}
    >
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={`text-label-xs flex-1 rounded-full px-3 py-1 text-center transition-colors duration-300 ease-out ${
              active ? 'text-primary shadow-s bg-white' : 'text-fg-inverse'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 카카오(구 다음) 우편번호 서비스 전역 타입.
 * 스크립트: https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js
 * `window.daum.Postcode` (신규 `kakao.Postcode` 도 별칭). 키 불필요.
 *
 * 주소 "검색 폼"을 이 서드파티 위젯에 위임한다 — api-convention 의 Route Handler→hooks
 * 흐름 예외(브라우저 위젯, REST 아님). FE-01 의 "PG 위젯 위임" 과 같은 패턴.
 */
interface DaumPostcodeData {
  /** 우편번호(5자리). */
  zonecode: string;
  /** 도로명 주소. */
  roadAddress: string;
  /** 지번 주소. */
  jibunAddress: string;
  /** 도로명 주소 + 참고항목(건물명 등). */
  roadAddressEnglish: string;
  /** 건물명. */
  buildingName: string;
  /** 시/도. */
  sido: string;
  /** 시/군/구. */
  sigungu: string;
  /** 법정동/법정리 이름. */
  bname: string;
  /** 사용자가 선택한 주소 타입: 'R'(도로명) | 'J'(지번). */
  userSelectedType: 'R' | 'J';
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void;
  onresize?: (size: { width: number; height: number }) => void;
  width?: string | number;
  height?: string | number;
}

interface DaumPostcodeInstance {
  /** 지정한 요소 안에 검색 UI 를 임베드한다. */
  embed: (element: HTMLElement, options?: { autoClose?: boolean; q?: string }) => void;
  /** 팝업 창으로 연다. */
  open: (options?: {
    left?: number;
    top?: number;
    popupName?: string;
    autoClose?: boolean;
  }) => void;
}

interface DaumPostcodeConstructor {
  new (options: DaumPostcodeOptions): DaumPostcodeInstance;
}

interface Window {
  daum?: { Postcode: DaumPostcodeConstructor };
  kakao?: { Postcode: DaumPostcodeConstructor };
}

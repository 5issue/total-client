/**
 * `apiClient.ts`(모듈, React 트리 밖)가 `AuthTokenStoreProvider` 내부의 Zustand 스토어를
 * 읽고/쓸 수 있게 하는 다리.
 *
 * ⚠️ 이 파일은 스토어 자체가 아니다 — "현재 값을 읽고/쓰는 함수" 참조만 보관한다.
 * 실제 상태(accessToken)는 여전히 `AuthTokenStoreProvider` 가 마운트당 만드는 스토어 인스턴스에
 * 있다 — 이 파일에 상태를 두면 code-style §3-2("Zustand 모듈 최상단 create() 싱글턴 금지")를
 * 위반한다. Provider 가 마운트될 때 `registerAccessTokenRef` 로 이 함수들을 배선한다.
 */

type Getter = () => string | null;
type Setter = (token: string) => void;
type Clearer = () => void;

let getter: Getter = () => null;
let setter: Setter = () => {};
let clearer: Clearer = () => {};

export function registerAccessTokenRef(refs: { get: Getter; set: Setter; clear: Clearer }): void {
  getter = refs.get;
  setter = refs.set;
  clearer = refs.clear;
}

export function getAccessToken(): string | null {
  return getter();
}

export function setAccessToken(token: string): void {
  setter(token);
}

export function clearAccessToken(): void {
  clearer();
}

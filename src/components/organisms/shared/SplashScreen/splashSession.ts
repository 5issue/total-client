/** 같은 탭 세션에서 스플래시를 이미 봤는지. `sessionStorage`라 탭을 닫거나 브라우저를 종료하면 사라진다. */
export const SPLASH_SHOWN_KEY = 'splash-shown';

export const SPLASH_BOOT_ID = 'splash-boot';

/**
 * 스플래시 컴포넌트보다 먼저 실행되는 블로킹 스크립트.
 * 아직 안 본 세션이면 브랜드색 막을 즉시 씌워, React가 로고 스플래시를 붙이기 전에
 * 본문이 비치지 않게 한다. 이미 본 세션이면 아무것도 하지 않는다.
 */
export const splashSeenBootScript = `(function(){try{if(sessionStorage.getItem(${JSON.stringify(SPLASH_SHOWN_KEY)}))return;var el=document.createElement("div");el.id=${JSON.stringify(SPLASH_BOOT_ID)};el.setAttribute("aria-hidden","true");el.style.cssText="position:fixed;inset:0;z-index:70;background:#50006b";document.documentElement.appendChild(el)}catch(e){}})();`;

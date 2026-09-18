import { setupServer } from 'msw/node';

import { authHandlers } from './handlers/auth';
import { cartHandlers } from './handlers/cart';
import { productHandlers } from './handlers/product';

/** Node(서버) 런타임 전용 MSW 서버. `src/instrumentation.ts` 가 조건부로 등록한다. */
export const server = setupServer(...authHandlers, ...productHandlers, ...cartHandlers);

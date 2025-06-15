import { setupConvex } from 'convex-svelte';

import { PUBLIC_CONVEX_URL } from '$env/static/public';

export const setupFrontendConvex = () => setupConvex(PUBLIC_CONVEX_URL);

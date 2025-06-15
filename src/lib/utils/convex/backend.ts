import { ConvexHttpClient } from 'convex/browser';

import { PUBLIC_CONVEX_URL } from '$env/static/public';

const convexBackendClient = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export default convexBackendClient;

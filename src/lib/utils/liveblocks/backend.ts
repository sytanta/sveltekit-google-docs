import { Liveblocks } from '@liveblocks/node';

import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';

const lbBackendClient = new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY });

export default lbBackendClient;

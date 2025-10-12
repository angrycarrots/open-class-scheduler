// Ensure Fetch API is available in Vitest (Node) environment using undici
import { fetch, Headers, Request, Response } from 'undici';

// Bind undici implementations globally for tests
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.fetch = fetch as any;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Headers = Headers as any;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Request = Request as any;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Response = Response as any;

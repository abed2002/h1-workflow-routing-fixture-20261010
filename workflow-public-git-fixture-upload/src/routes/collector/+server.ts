import { createHash, timingSafeEqual } from 'node:crypto';

const validProbeId = /^[0-9a-f]{16}$/;

export async function POST({ request }: { request: Request }) {
  const expected = process.env.WORKFLOW_CANARY_TOKEN;
  const supplied = request.headers.get('x-workflow-canary-token');
  if (!expected || !supplied) {
    return new Response(null, { status: 401 });
  }

  const expectedHash = createHash('sha256').update(expected).digest();
  const suppliedHash = createHash('sha256').update(supplied).digest();
  if (!timingSafeEqual(expectedHash, suppliedHash)) {
    return new Response(null, { status: 401 });
  }

  const rawBody = await request.text();
  if (rawBody.length > 256) {
    return new Response(null, { status: 413 });
  }
  let probeId: unknown;
  try {
    probeId = JSON.parse(rawBody)?.probeId;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof probeId !== 'string' || !validProbeId.test(probeId)) {
    return new Response(null, { status: 400 });
  }

  console.log(`WORKFLOW_COLLECTOR_ACCEPTED probeId=${probeId}`);
  return new Response(null, { status: 204 });
}

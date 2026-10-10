export async function sampleWorkflow(probeId: string) {
  'use workflow';
  await sampleStep(probeId);
  return `finished:${probeId}`;
}

async function sampleStep(probeId: string) {
  'use step';
  const token = process.env.WORKFLOW_CANARY_TOKEN;
  const deploymentHost = process.env.VERCEL_URL ??
    (process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : undefined);
  const origin = deploymentHost
    ? `https://${deploymentHost}`
    : process.env.VERCEL === '1'
      ? undefined
      : process.env.WORKFLOW_COLLECTOR_ORIGIN;

  if (!token || !origin) {
    throw new Error('Owned Workflow canary configuration is missing');
  }

  const response = await fetch(new URL('/collector', origin), {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'content-type': 'application/json',
      'x-workflow-canary-token': token,
    },
    body: JSON.stringify({ probeId }),
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status !== 204) {
    throw new Error(`Owned Workflow canary collector returned ${response.status}`);
  }
  console.log(`WORKFLOW_LIVE_PROBE_STEP_EXECUTED probeId=${probeId}`);
}

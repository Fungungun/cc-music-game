export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);
  const hasPrivateSegment = pathname
    .split('/')
    .some((segment) => segment.startsWith('.') && segment !== '.well-known');
  const hasPrivateRoot = pathname === '/growth-experiments.md' ||
    pathname === '/wrangler.toml' || pathname === '/CLAUDE.md' ||
    pathname.startsWith('/reports/') || pathname.startsWith('/migrations/') ||
    pathname.startsWith('/functions/');

  if (hasPrivateSegment || hasPrivateRoot) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return context.next();
}

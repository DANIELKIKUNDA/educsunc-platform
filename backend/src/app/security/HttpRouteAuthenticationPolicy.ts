export type HttpRouteAccess = 'PUBLIC' | 'PRIVATE';

export interface HttpRouteDescriptor {
  method: string;
  url: string;
}

interface PublicHttpRoute {
  method: string;
  path: string;
  environments?: readonly string[];
}

// Cette liste explicite constitue l'unique surface HTTP accessible sans session.
const PUBLIC_HTTP_ROUTES: readonly PublicHttpRoute[] = [
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/health/live' },
  { method: 'GET', path: '/health/ready' },
  // Prometheus utilise un jeton de supervision dedie gere par la route elle-meme.
  { method: 'GET', path: '/metrics' },
  {
    method: 'GET',
    path: '/openapi.json',
    environments: ['development', 'test'],
  },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/refresh' },
  { method: 'GET', path: '/api/auth/initialisation' },
  { method: 'POST', path: '/api/auth/initialisation' },
  {
    method: 'POST',
    path: '/api/auth/dev/session',
    environments: ['development'],
  },
];

export class HttpRouteAuthenticationPolicy {
  public constructor(private readonly environment: string) {}

  public getAccess(route: HttpRouteDescriptor): HttpRouteAccess {
    const method = route.method.trim().toUpperCase();
    const path = normalizePath(route.url);
    const isPublic = PUBLIC_HTTP_ROUTES.some((candidate) =>
      candidate.method === method
      && candidate.path === path
      && (
        candidate.environments === undefined
        || candidate.environments.includes(this.environment)
      ),
    );

    return isPublic ? 'PUBLIC' : 'PRIVATE';
  }

  public isPublic(route: HttpRouteDescriptor): boolean {
    return this.getAccess(route) === 'PUBLIC';
  }
}

export function listPublicHttpRoutes(environment: string): readonly HttpRouteDescriptor[] {
  return PUBLIC_HTTP_ROUTES
    .filter((route) =>
      route.environments === undefined
      || route.environments.includes(environment),
    )
    .map((route) => ({ method: route.method, url: route.path }));
}

function normalizePath(url: string): string {
  const path = url.split('?', 1)[0]?.trim() || '/';
  if (path === '/') {
    return path;
  }

  return path.endsWith('/') ? path.slice(0, -1) : path;
}

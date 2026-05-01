import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode as decodeJwt } from 'jwt-decode';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbChevron,
  Moon,
  PanelLeft,
  RotateCw,
  SunMedium,
  UserCircle2,
  ListTree,
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  adminNavSections,
  type AdminNavSection,
  getStoredRoles,
  hasAnyRole,
} from '../../adminShell';
import authProvider, { clearLocalStorage } from '../app/authProvider';
import Role from './role';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Notification } from '@/components/admin/notification';
import { cn } from '../../lib/utils';
import { rememberListLocation } from '../shared/listNavigation';
const THEME_STORAGE_KEY = 'nomos-kit-theme';
const ORIGINAL_SCOPES_STORAGE_KEY = 'original_scopes';
const MASKED_SCOPES_STORAGE_KEY = 'masked_scopes';
const ADMIN_ROLE_OPTIONS = [Role.SUPER_ADMIN, Role.APPLICATION_SUPPORT];
const ROLE_MASK_OPTIONS = [
  Role.READER,
  Role.OFFICER,
  Role.CONSERVATION_OFFICER,
  Role.MANAGER,
  Role.APPLICATION_SUPPORT,
] as const;
const kitRoutes = new Set([
  '/',
  '/kit',
  '/taxon_names',
  '/taxon_name_parent_reviews',
  '/taxon_names_code',
  '/vernaculars',
  '/hierarchies',
  '/cross_references',
  '/taxon_ranks',
  '/kingdoms',
  '/classification_systems',
  '/informal_groups',
  '/publications',
  '/authors',
  '/citations',
  '/conservation_codes',
  '/conscode_taxons',
  '/users',
]);

const formatBreadcrumb = (segment: string) =>
  segment
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const parseRoleStorage = (value: string | null): string[] =>
  (value || '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

const getTokenRoles = (): string[] => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  try {
    const decoded: { scopes?: string[] | string } = decodeJwt(token);
    if (Array.isArray(decoded.scopes)) {
      return decoded.scopes.map((role) => String(role).trim()).filter(Boolean);
    }
    if (typeof decoded.scopes === 'string') {
      return parseRoleStorage(decoded.scopes);
    }
  } catch (error) {
    return [];
  }

  return [];
};

const AdminKitLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [authState, setAuthState] = React.useState<
    'checking' | 'ready' | 'redirecting'
  >('checking');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [roles, setRoles] = React.useState<string[]>(() => getStoredRoles());
  const [visibleSections, setVisibleSections] =
    React.useState<AdminNavSection[]>(adminNavSections);
  const [originalRoles, setOriginalRoles] = React.useState<string[]>(() =>
    parseRoleStorage(localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY))
  );
  const [tokenRoles, setTokenRoles] = React.useState<string[]>(() =>
    getTokenRoles()
  );
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const fullName = localStorage.getItem('fullName') || 'Nomos user';
  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const breadcrumbs = React.useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (!segments.length) {
      return [{ label: 'Dashboard', to: '/' }];
    }

    return segments.map((segment, index) => ({
      label: formatBreadcrumb(segment),
      to: `/${segments.slice(0, index + 1).join('/')}`,
    }));
  }, [location.pathname]);
  const storedRoles = getStoredRoles();
  const storedOriginalRoles = parseRoleStorage(
    localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY)
  );
  const actualRoles =
    storedOriginalRoles.length > 0
      ? storedOriginalRoles
      : tokenRoles.length > 0
        ? tokenRoles
        : storedRoles;
  const hasAdminOrigin = actualRoles.some((role) =>
    ADMIN_ROLE_OPTIONS.includes(role as (typeof ADMIN_ROLE_OPTIONS)[number])
  );
  const canMaskRoles =
    hasAdminOrigin || localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY) != null;
  const isRoleMasked =
    storedOriginalRoles.length > 0 &&
    storedOriginalRoles.join(',') !== storedRoles.join(',');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = prefersDark ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, []);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  React.useEffect(() => {
    const syncRoles = () => {
      setRoles(getStoredRoles());
      setOriginalRoles(
        parseRoleStorage(localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY))
      );
      setTokenRoles(getTokenRoles());
    };

    window.addEventListener('storage', syncRoles);
    return () => window.removeEventListener('storage', syncRoles);
  }, []);

  React.useEffect(() => {
    let active = true;

    const resolveVisibleSections = async () => {
      const nextSections = (
        await Promise.all(
          adminNavSections.map(async (section) => {
            const items = (
              await Promise.all(
                section.items.map(async (item) => {
                  if (!item.resource || !item.action) {
                    return hasAnyRole(roles, item.roles) ? item : null;
                  }

                  const canAccess = await authProvider.canAccess({
                    resource: item.resource,
                    action: item.action,
                  });

                  return canAccess ? item : null;
                })
              )
            ).filter(Boolean) as AdminNavSection['items'];

            return { ...section, items };
          })
        )
      ).filter((section) => section.items.length > 0);

      if (active) {
        setVisibleSections(nextSections);
      }
    };

    void resolveVisibleSections();

    return () => {
      active = false;
    };
  }, [roles]);

  React.useEffect(() => {
    let active = true;
    const AUTH_CHECK_TIMEOUT_MS = 10000;
    let timeoutId: number | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error('Auth check timed out'));
      }, AUTH_CHECK_TIMEOUT_MS);
    });

    Promise.race([authProvider.checkAuth(), timeoutPromise])
      .then(() => {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        if (active) {
          setAuthState('ready');
        }
      })
      .catch(() => {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        if (!active) {
          return;
        }
        setAuthState('redirecting');
        navigate('/login', { replace: true });
      });

    return () => {
      active = false;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  React.useEffect(() => {
    if (kitRoutes.has(location.pathname)) {
      rememberListLocation(location.pathname, location.search);
    }
  }, [location.pathname, location.search]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = () => {
    const logoutLink =
      window.location.origin + (localStorage.getItem('logout_url') || '/');
    clearLocalStorage();
    window.location.href = logoutLink;
  };

  const applyMaskedRoles = (nextRoles: string[]) => {
    if (!canMaskRoles) {
      return;
    }

    const existingOriginalRoles =
      parseRoleStorage(localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY));
    const nextOriginalRoles =
      existingOriginalRoles.length > 0 ? existingOriginalRoles : actualRoles;

    if (existingOriginalRoles.length === 0) {
      localStorage.setItem(ORIGINAL_SCOPES_STORAGE_KEY, actualRoles.join(','));
    }

    localStorage.setItem('scopes', nextRoles.join(','));
    localStorage.setItem(MASKED_SCOPES_STORAGE_KEY, nextRoles.join(','));
    setOriginalRoles(nextOriginalRoles);
    setTokenRoles(getTokenRoles());
    setRoles(nextRoles);
    setUserMenuOpen(false);
    queryClient.invalidateQueries({ queryKey: ['auth', 'canAccess'] });
  };

  const resetMaskedRoles = () => {
    if (!localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY)) {
      return;
    }

    const existingOriginalRoles = parseRoleStorage(
      localStorage.getItem(ORIGINAL_SCOPES_STORAGE_KEY)
    );
    const restoredRoles =
      existingOriginalRoles.length > 0 ? existingOriginalRoles : actualRoles;

    localStorage.setItem('scopes', restoredRoles.join(','));
    localStorage.removeItem(MASKED_SCOPES_STORAGE_KEY);
    localStorage.removeItem(ORIGINAL_SCOPES_STORAGE_KEY);
    setRoles(restoredRoles);
    setOriginalRoles([]);
    setTokenRoles(getTokenRoles());
    setUserMenuOpen(false);
    queryClient.invalidateQueries({ queryKey: ['auth', 'canAccess'] });
  };

  if (authState !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading admin workspace...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),_transparent_28%),_var(--background)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_24%),_var(--background)]">
        <div className="sticky top-0 z-40 border-b border-border bg-white px-4 py-2 shadow-[0_3px_12px_rgba(15,23,42,0.04)] md:px-6 dark:bg-card">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Link to="/" className="flex items-center gap-3 rounded-2xl pr-2 transition hover:bg-accent/40">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-2xl"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    <ListTree className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 truncate text-base text-foreground">
                    <span className="font-semibold">Nomos</span>{' '}
                    <span className="font-normal">Taxonomic Names Register</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:inline-flex">
                v{import.meta.env.VITE_APP_VERSION}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunMedium className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                aria-label="Refresh"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <div className="relative" ref={userMenuRef}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="relative h-8 w-8 rounded-full"
                  aria-label="User menu"
                >
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    {initials || <UserCircle2 className="h-4 w-4" />}
                  </div>
                </Button>
                {userMenuOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {localStorage.getItem('username') || 'Signed in'}
                      </p>
                    </div>
                    <Separator className="my-1" />
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-accent"
                    >
                      <span>Theme</span>
                      <span className="text-muted-foreground">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </button>
                    {canMaskRoles ? (
                      <>
                        <Separator className="my-1" />
                        <div className="px-3 py-2">
                          <p className="text-xs font-medium text-foreground">
                            Admin role view
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Current: {storedRoles.join(', ') || 'None'}
                          </p>
                        </div>
                        {ROLE_MASK_OPTIONS.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => applyMaskedRoles([role])}
                            disabled={
                              storedRoles.length === 1 && storedRoles[0] === role
                            }
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-accent disabled:cursor-default disabled:opacity-50"
                          >
                            <span>View as {formatBreadcrumb(role.toLowerCase())}</span>
                            {storedRoles.length === 1 && storedRoles[0] === role ? (
                              <span className="text-xs text-muted-foreground">
                                Active
                              </span>
                            ) : null}
                          </button>
                        ))}
                        {isRoleMasked ? (
                          <button
                            type="button"
                            onClick={resetMaskedRoles}
                            className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-accent"
                          >
                            Return to admin
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-sm transition hover:bg-accent"
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex min-h-[calc(100vh-56px)] w-full gap-6 pl-0 pr-4 md:pr-6">
          <aside
            className={cn(
              'hidden transition-all duration-300 md:block',
              collapsed ? 'w-18' : 'w-80'
            )}
          >
            <Card className="flex h-full flex-col rounded-none border-t-0 bg-card">
              <nav className="flex-1 p-3">
                <div className="space-y-5">
                  {visibleSections.map((section) => {
                    const { items } = section;

                    if (!items.length) {
                      return null;
                    }

                    return (
                      <div key={section.label}>
                        {!collapsed ? (
                          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {section.label}
                          </p>
                        ) : null}
                        <div className="space-y-1">
                          {items.map((item) => {
                            const to = item.to;
                            const active = location.pathname === to;
                            const navLink = (
                              <Link
                                to={to}
                                className={cn(
                                  'flex min-h-11 items-center rounded-2xl px-3 text-sm font-medium transition',
                                  collapsed ? 'justify-center' : 'gap-3',
                                  active
                                    ? ''
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                )}
                                style={
                                  active
                                    ? {
                                        backgroundColor: 'var(--primary)',
                                        color: 'var(--primary-foreground)',
                                      }
                                    : undefined
                                }
                              >
                                <span className="flex h-5 w-5 items-center justify-center">
                                  {item.icon}
                                </span>
                                {!collapsed ? <span>{item.label}</span> : null}
                              </Link>
                            );

                            return (
                              <React.Fragment key={item.to}>{navLink}</React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </Card>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col gap-4 pb-6">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed((value) => !value)}
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Link to="/" className="font-medium text-muted-foreground transition hover:text-foreground">
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.to}>
                  <BreadcrumbChevron className="h-4 w-4 text-muted-foreground" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="truncate font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.to}
                      className="truncate font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Outlet key={roles.join(',') || 'no-roles'} />
          </main>
        </div>
      </div>
      <Notification />
    </>
  );
};

export default AdminKitLayout;

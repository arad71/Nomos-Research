import * as React from 'react';
import { CanAccess } from 'react-admin';
import {
  ArrowRight,
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
import { adminNavSections, getStoredRoles, hasAnyRole } from '../adminShell';
import authProvider, { clearLocalStorage } from '../admin/authProvider';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';

const legacyPath = (path: string) => `/legacy${path === '/' ? '' : path}`;
const THEME_STORAGE_KEY = 'nomos-kit-theme';
const kitRoutes = new Set([
  '/',
  '/kit',
  '/taxon_names',
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

const AdminKitLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [authState, setAuthState] = React.useState<
    'checking' | 'ready' | 'redirecting'
  >('checking');
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const roles = getStoredRoles();
  const location = useLocation();
  const navigate = useNavigate();
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
    let active = true;

    authProvider
      .checkAuth()
      .then(() => {
        if (active) {
          setAuthState('ready');
        }
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setAuthState('redirecting');
        navigate('/legacy', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

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

  if (authState !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading admin workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),_transparent_28%),_var(--background)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_24%),_var(--background)]">
      <div className="border-b border-border bg-white px-4 py-2 shadow-[0_3px_12px_rgba(15,23,42,0.04)] md:px-6 dark:bg-card">
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
      <div className="flex min-h-[calc(100vh-69px)] w-full gap-6 p-4 md:p-6">
        <aside
          className={cn(
            'hidden transition-all duration-300 md:block',
            collapsed ? 'w-18' : 'w-80'
          )}
        >
          <Card className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-card">
            <nav className="flex-1 overflow-y-auto p-3">
              <div className="space-y-5">
                {adminNavSections.map((section) => {
                  const items = section.items.filter((item) =>
                    hasAnyRole(roles, item.roles)
                  );

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
                          const to = kitRoutes.has(item.to)
                            ? item.to
                            : legacyPath(item.to);
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

                          if (!item.resource || !item.action) {
                            return <React.Fragment key={item.to}>{navLink}</React.Fragment>;
                          }

                          return (
                            <CanAccess
                              key={item.to}
                              resource={item.resource}
                              action={item.action}
                            >
                              {navLink}
                            </CanAccess>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>
            <div className="p-3">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="w-full"
                aria-label="Legacy admin"
              >
                <Link to="/legacy">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminKitLayout;

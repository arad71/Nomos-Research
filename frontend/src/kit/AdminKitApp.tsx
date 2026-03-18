import * as React from 'react';
import { CanAccess } from 'react-admin';
import { ArrowRight, BookOpen, Database, FolderTree, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardActions } from '../adminShell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

const overviewCards = [
  {
    title: 'Taxonomy',
    description: 'Core names, hierarchy, and rank management.',
    icon: BookOpen,
  },
  {
    title: 'References',
    description: 'Publications, authors, and citation operations.',
    icon: Database,
  },
  {
    title: 'Conservation',
    description: 'Statuses, codes, and taxon relationships.',
    icon: FolderTree,
  },
  {
    title: 'Access',
    description: 'Roles and controlled admin operations.',
    icon: Shield,
  },
];

const legacyPath = (path: string) => `/legacy${path === '/' ? '' : path}`;

const AdminKitApp = () => (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <header className="rounded-[28px] border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Migration workspace
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Shadcn admin kit baseline
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/taxon_names">
                Open taxon names in kit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/legacy">Open legacy admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#111827_0%,#1f2937_52%,#374151_100%)] text-white">
          <CardHeader>
            <Badge className="w-fit bg-white/10 text-white hover:bg-white/10">
              Phase 1
            </Badge>
            <CardTitle className="text-3xl">Taxon names migration has started</CardTitle>
            <CardDescription className="max-w-2xl text-white/70">
              The kit now has its own routed shell, and taxon names is the first resource moving out of the legacy MUI admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/taxon_names">Open kit taxon names</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/legacy/taxon_names">Compare with legacy list</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggested next migration slice</CardTitle>
            <CardDescription>
              Other resources still open in the legacy admin until we rebuild them in the kit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardActions.map((action) => (
              <CanAccess
                key={action.to}
                resource={action.resource ?? 'taxon_names'}
                action={action.action ?? 'list'}
              >
                <Link
                  to={action.to}
                  className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 transition hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CanAccess>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
);

export default AdminKitApp;

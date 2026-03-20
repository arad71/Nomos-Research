import * as React from 'react';
import { CanAccess } from 'react-admin';
import {
  ArrowRight,
  BookOpen,
  Database,
  FolderTree,
  PlusCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminNavSections, dashboardActions } from '../adminShell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

const sectionIcons = {
  Taxonomy: BookOpen,
  References: Database,
  Status: FolderTree,
  Administration: Shield,
} as const;

const startActions = dashboardActions.slice(0, 4);
const adminActions = dashboardActions.slice(4);

const AdminKitApp = () => (
  <div className="flex min-w-0 flex-1 flex-col gap-6">
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <Card
        className="overflow-hidden border-none shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--primary) 88%, white 12%) 0%, var(--primary) 42%, color-mix(in srgb, var(--primary) 70%, black 30%) 100%)',
          color: 'var(--primary-foreground)',
        }}
      >
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-white/16 text-inherit hover:bg-white/16">
              Dashboard
            </Badge>
            <Badge className="border-0 bg-white/12 text-inherit hover:bg-white/12">
              Live workspace
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl tracking-tight">
              Start work in the taxonomic register
            </CardTitle>
            <CardDescription className="max-w-2xl text-[color:color-mix(in_srgb,var(--primary-foreground)_78%,transparent)]">
              Open the core register, create new records, or jump straight into the
              highest-use workflows without stepping through the menu first.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="secondary"
            className="border-0 bg-white hover:bg-white/90"
            style={{ color: 'var(--primary)' }}
          >
            <Link to="/taxon_names" style={{ color: 'var(--primary)' }}>
              Open taxon names
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 bg-transparent text-inherit hover:bg-white/10 hover:text-inherit"
          >
            <Link to="/taxon_names/create">
              Create taxon name
              <PlusCircle className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>Common actions</CardTitle>
          </div>
          <CardDescription>
            The tasks most staff are likely to need at the start of the day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {startActions.map((action) => (
            <CanAccess
              key={action.to}
              resource={action.resource ?? 'taxon_names'}
              action={action.action ?? 'list'}
            >
              <Link
                to={action.to}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </CanAccess>
          ))}
        </CardContent>
      </Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {adminNavSections
        .filter((section) => section.label !== 'Overview')
        .map((section) => {
          const Icon = sectionIcons[section.label as keyof typeof sectionIcons] ?? BookOpen;

          return (
            <Card key={section.label} className="border-border/80">
              <CardHeader className="space-y-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                    color: 'var(--primary)',
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{section.label}</CardTitle>
                  <CardDescription>
                    {section.items.length} workspace link{section.items.length === 1 ? '' : 's'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items.slice(0, 4).map((item) => (
                  <CanAccess
                    key={item.to}
                    resource={item.resource ?? 'taxon_names'}
                    action={item.action ?? 'list'}
                  >
                    <Link
                      to={item.to}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-accent"
                    >
                      <span className="truncate">{item.label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </CanAccess>
                ))}
              </CardContent>
            </Card>
          );
        })}
    </section>

    {adminActions.length ? (
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Browse by area</CardTitle>
            <CardDescription>
              Jump directly to the core register areas without opening the side menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {adminNavSections
              .flatMap((section) =>
                section.label === 'Overview'
                  ? []
                  : section.items.map((item) => ({ ...item, section: section.label }))
              )
              .map((item) => (
                <CanAccess
                  key={item.to}
                  resource={item.resource ?? 'taxon_names'}
                  action={item.action ?? 'list'}
                >
                  <Link
                    to={item.to}
                    className="flex items-start justify-between rounded-md border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.section}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </CanAccess>
              ))}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Administrative tasks</CardTitle>
            <CardDescription>
              Lower-frequency actions that still need to stay close at hand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminActions.map((action) => (
              <CanAccess
                key={action.to}
                resource={action.resource ?? 'taxon_names'}
                action={action.action ?? 'list'}
              >
                <Link
                  to={action.to}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </CanAccess>
            ))}
          </CardContent>
        </Card>
      </section>
    ) : null}
  </div>
);

export default AdminKitApp;

import * as React from 'react';
import { useCanAccess } from 'ra-core';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

type AccessGuardProps = {
  resource: string;
  action: string;
  children: React.ReactNode;
};

const AccessGuard = ({ resource, action, children }: AccessGuardProps) => {
  const { canAccess, isPending, error } = useCanAccess({ resource, action });

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Checking access...
      </div>
    );
  }

  if (error || !canAccess) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You do not have permission to {action} this resource in the new
              workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link to="/kit">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Sign in again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessGuard;

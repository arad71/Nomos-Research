import * as React from 'react';
import { useCanAccess } from 'ra-core';
import AccessDeniedPage from './AccessDeniedPage';

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
    return <AccessDeniedPage action={action} />;
  }

  return <>{children}</>;
};

export default AccessGuard;

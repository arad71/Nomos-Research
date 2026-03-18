import * as React from 'react';
import { CanAccess } from 'react-admin';
import { Link } from 'react-router-dom';
import { Button, type ButtonProps } from '../components/ui/button';

type AuthorizedButtonLinkProps = Omit<ButtonProps, 'asChild'> & {
  resource: string;
  action: string;
  to: string;
  children: React.ReactNode;
};

const AuthorizedButtonLink = ({
  resource,
  action,
  to,
  children,
  ...buttonProps
}: AuthorizedButtonLinkProps) => (
  <CanAccess resource={resource} action={action}>
    <Button asChild {...buttonProps}>
      <Link to={to}>{children}</Link>
    </Button>
  </CanAccess>
);

export default AuthorizedButtonLink;

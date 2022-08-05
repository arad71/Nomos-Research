import React, { FC } from 'react';
import { useRedirect } from 'react-admin';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { clearLocalStorage } from './admin';
import Button from '@material-ui/core/Button';

export const LogoutButton: FC = () => {
  // The redirect hook accepts external absolute links but,
  // will only sit in function components. Hence, moving it here.
  const handleClick = () => redirect(logoutLink);
  const redirect = useRedirect();
  const logoutLink =
    window.location.origin + localStorage.getItem('logout_url');
  clearLocalStorage();
  return (
    <Button onClick={handleClick} startIcon={<PowerSettingsNewIcon />}>
      Logout
    </Button>
  );
};

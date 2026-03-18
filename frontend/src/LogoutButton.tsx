import React, { FC } from 'react';
import { useRedirect } from 'react-admin';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { clearLocalStorage } from './admin';
import Button from '@mui/material/Button';

export const LogoutButton: FC = () => {
  // The redirect hook accepts external absolute links but,
  // will only sit in function components. Hence, moving it here.
  const redirect = useRedirect();
  const logoutLink =
    window.location.origin + (localStorage.getItem('logout_url') || '/');
  const handleClick = () => {
    clearLocalStorage();
    redirect(logoutLink);
  };
  return (
    <Button
      onClick={handleClick}
      startIcon={<PowerSettingsNewIcon />}
      color="inherit"
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        px: 1.5,
        textTransform: 'none',
      }}
    >
      Logout
    </Button>
  );
};

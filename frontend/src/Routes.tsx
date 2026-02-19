import React, { FC } from 'react';
import { Navigate, Route, Routes as ReactRouterRoutes } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';

import { SignUp } from './views';
import { Admin } from './admin';
import { logout } from './utils';

const useStyles = makeStyles(() => ({
  app: {
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fafafa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
}));

export const Routes: FC = () => {
  const classes = useStyles();

  return (
    <ReactRouterRoutes>
      <Route path="/*" element={<Admin />} />
      <Route
        path="/signup"
        element={
          <div className={classes.app}>
            <header className={classes.header}>
              <SignUp />
            </header>
          </div>
        }
      />
      <Route
        path="/logout"
        element={(() => {
          logout();
          return <Navigate to="/" replace />;
        })()}
      />
    </ReactRouterRoutes>
  );
};

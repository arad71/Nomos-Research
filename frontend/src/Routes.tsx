import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';

import { Home, Login, SignUp, Protected, PrivateRoute } from './views';
import { Admin } from './admin';
import { logout } from './utils/auth';

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
  const history = useHistory();

  return (
      <Switch>
        <Route exact path="/" component={Admin} />
        <div className={classes.app}>
          <header className={classes.header}>
            <Route path="/signup" component={SignUp} />
            <Route
                path="/logout"
                render={() => {
                  logout();
                  history.push('/');
                  return null;
                }}
            />
          </header>
        </div>
      </Switch>
  );
};
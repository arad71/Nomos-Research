import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import logo from '../assets/img/taxman_logo.png';
import { isAuthenticated } from '../utils';

const useStyles = makeStyles((theme: any) => ({
  link: {
    color: '#61dafb',
  },
  logo: {
    width: '500px',
  },
  button: {
    margin: '10px 0px',
  },
  title: {
    fontWeight: 'bold',
  },
  landingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 20px',
    border: '1px solid #62646a',
    borderRadius: '25px',
    backgroundColor: '#ffffff',
    filter: 'drop-shadow(0 0 0.4rem grey)',
  },
  toolBar: {
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

export const Home: FC = () => {
  const classes = useStyles();

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className={classes.toolBar}>
          <Typography variant="h6" className={classes.title}>
            Taxonomic Names Manager
          </Typography>
          <Button color="inherit" href="/admin">
            Admin Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.landingContainer}>
        <img src={logo} className={classes.logo} alt="Logo" />
        {isAuthenticated() ? (
          <Button variant="contained" className={classes.button} href="/logout">
            Logout
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              className={classes.button}
              href="/login"
            >
              Login
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              href="/signup"
            >
              Signup
            </Button>
          </>
        )}
      </div>
    </>
  );
};

import React, { FC, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import logo from '../assets/img/taxman_logo.png'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { getMessage } from '../utils/api';
import { isAuthenticated } from '../utils/auth';

const useStyles = makeStyles((theme) => ({
  link: {
    color: '#61dafb'
  },
  logo: {
    width: '500px',
  },
  button: {
    margin: '10px 0px'
  },
  landingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 20px',
    border: '1px solid #62646a',
    borderRadius: '25px',
    backgroundColor: "#ffffff",
    filter: 'drop-shadow(0 0 0.4rem grey)'
  },
  toolBar: {
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

export const Home: FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const classes = useStyles();

  // const queryBackend = async () => {
  //   try {
  //     const newMessage = await getMessage();
  //     setMessage(newMessage);
  //   } catch (err) {
  //     setError(String(err));
  //   }
  // };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className={classes.toolBar}>
          <Typography variant="h6" className={classes.title}>
            Taxonomic Names Manager
          </Typography>
          <Button color="inherit" href="/admin">Admin Dashboard</Button>
        </Toolbar>
      </AppBar>
      <div className={classes.landingContainer}>
        <img src={logo} className={classes.logo} alt="Logo" />
        {/*{!message && !error && (*/}
        {/*  <Button*/}
        {/*    // className={classes.link}*/}
        {/*    variant="contained"*/}
        {/*    // type="button"*/}
        {/*    onClick={() => queryBackend()}*/}
        {/*  >*/}
        {/*    Click to make request to backend*/}
        {/*  </Button>*/}
        {/*)}*/}
        {/*{message && (*/}
        {/*  <p>*/}
        {/*    <code>{message}</code>*/}
        {/*  </p>*/}
        {/*)}*/}
        {/*{error && (*/}
        {/*  <p>*/}
        {/*    Error: <code>{error}</code>*/}
        {/*  </p>*/}
        {/*)}*/}
        {isAuthenticated() ? (
            <Button variant="contained" className={classes.button} href="/logout">Logout</Button>
        ) : (
            <>
              <Button variant="contained" className={classes.button} href="/login">Login</Button>
              <Button variant="contained" className={classes.button} href="/signup">Signup</Button>
            </>
        )}
        {/*<Button variant="contained" className={classes.button} href="/protected">*/}
        {/*  Protected Route*/}
        {/*</Button>*/}
      </div>
    </>
  );
};

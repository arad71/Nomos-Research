import React, { FC, useState } from 'react';
import { useLogin, useNotify, Notification } from 'react-admin';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import logo from '../assets/img/tom-ohlin-owYSd_TXoEc-unsplash-1500.jpg'
import dbcaLogo from '../assets/img/logo-dbca-bio-dark.svg'
import { makeStyles } from '@material-ui/core/styles';
import authProvider from "../admin/authProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url(${logo})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  mainLogo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    marginBottom: '1.5rem'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '75%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    backgroundColor: "#1B5553"
  },
  loginHelpers: {
    margin: theme.spacing(3, 0, 2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start'
  },
}));

const NewLogin: FC = () => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const notify = useNotify();
  const submit = (e) => {
    e.preventDefault();
    login({ email, password })
        .catch(() => notify('Invalid email or password'));
  };

  return (
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={12} sm={8} md={6} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Paper elevation={0} className={classes.mainLogo}>
              <img src={dbcaLogo} height="70%" width="70%"/>
            </Paper>
            <Typography component="h1" variant="h3" align="left">
              Taxonomic Names Manager
            </Typography>
            <Typography component="h1" variant="h6">
              Log in
            </Typography>
            <form className={classes.form} onSubmit={submit} noValidate>
              <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
              />
              <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
              />
              <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disableElevation
              >
                Login
              </Button>
              <Grid container className={classes.loginHelpers}>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Register here"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>
        <Grid item xs={false} sm={4} md={6} className={classes.image} />
      </Grid>
  );
}

export default NewLogin;
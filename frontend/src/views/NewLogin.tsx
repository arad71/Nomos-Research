import React, { FC, useState } from 'react';
import { useTranslate, useLogin, useNotify, useSafeSetState } from 'react-admin';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import logo from '../assets/img/tom-ohlin-owYSd_TXoEc-unsplash-1500.jpg'
import dbcaLogo from '../assets/img/logo-dbca-bio-dark.svg'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";
import { Field, Form } from 'react-final-form';

interface Props {
  redirectTo?: string;
}

interface FormData {
  username: string;
  password: string;
}

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

const Input = ({
                 meta: { touched, error }, // eslint-disable-line react/prop-types
                 input: inputProps, // eslint-disable-line react/prop-types
                 ...props
               }) => (
    <TextField
        error={!!(touched && error)}
        helperText={touched && error}
        {...inputProps}
        {...props}
        fullWidth
        margin="normal"
        variant="outlined"
    />
);

const NewLogin = (props: Props) => {
  const { redirectTo } = props;
  const classes = useStyles();
  const [loading, setLoading] = useSafeSetState(false);
  const login = useLogin();
  const translate = useTranslate();
  const notify = useNotify();

  const validate = (values: FormData) => {
    const errors = { username: undefined, password: undefined };

    if (!values.username) {
      errors.username = translate('ra.validation.required');
    }
    if (!values.password) {
      errors.password = translate('ra.validation.required');
    }
    return errors;
  };

  const submit = values => {
    setLoading(true);
    login(values, redirectTo)
        .then(() => {
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          notify(
              typeof error === 'string'
                  ? error
                  : typeof error === 'undefined' || !error.message
                      ? 'ra.auth.sign_in_error'
                      : error.message,
              {
                type: 'warning',
                messageArgs: {
                  _:
                      typeof error === 'string'
                          ? error
                          : error && error.message
                              ? error.message
                              : undefined,
                },
              }
          );
        });
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
              NOMOS
            </Typography>
            <Typography component="h1" variant="h6">
              Log in
            </Typography>
            <Form
                onSubmit={submit}
                validate={validate}
                render={({ handleSubmit }) => (
                  <form className={classes.form} onSubmit={handleSubmit} noValidate>
                    <Field
                        autoFocus
                        id="username"
                        name="username"
                        component={Input}
                        label={translate('ra.auth.username')}
                        disabled={loading}
                    />
                    <Field
                        id="password"
                        name="password"
                        component={Input}
                        label={translate('ra.auth.password')}
                        type="password"
                        disabled={loading}
                        autoComplete="current-password"
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
                        <Link href="/signup" variant="body2">
                          {"Don't have an account? Register here"}
                        </Link>
                      </Grid>
                    </Grid>
                  </form>
                )}
            />
          </div>
        </Grid>
        <Grid item xs={false} sm={4} md={6} className={classes.image} />
      </Grid>
  );
};

NewLogin.propTypes = {
  redirectTo: PropTypes.string,
};

export default NewLogin;

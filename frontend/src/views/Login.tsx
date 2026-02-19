import React, { FC, useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import makeStyles from 'lib/makeStyles';
import { Face, Fingerprint } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import { Navigate, useNavigate } from 'react-router-dom';

import { login, isAuthenticated } from '../utils/auth';

const useStyles = makeStyles((theme: any) => ({
  margin: {
    margin: theme.spacing(2),
  },
  padding: {
    padding: theme.spacing(1),
  },
  button: {
    textTransform: 'none',
  },
  marginTop: {
    marginTop: 10,
  },
}));

export const Login: FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    setError('');
    try {
      const data = await login(email, password);

      if (data) {
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        // handle errors thrown from frontend
        setError(err.message);
      } else {
        // handle errors thrown from backend
        setError(String(err));
      }
    }
  };

  return isAuthenticated() ? (
    <Navigate to="/" replace />
  ) : (
    <Paper className={classes.padding}>
      <div className={classes.margin}>
        <Grid container spacing={8} alignItems="flex-end">
          <Grid item>
            <Face />
          </Grid>
          <Grid item md sm xs>
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.currentTarget.value)
              }
              fullWidth
              autoFocus
              required
            />
          </Grid>
        </Grid>
        <Grid container spacing={8} alignItems="flex-end">
          <Grid item>
            <Fingerprint />
          </Grid>
          <Grid item md sm xs>
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.currentTarget.value)
              }
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <br />
        <Grid container alignItems="center">
          {error && (
            <Grid item>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Remember me"
            />
          </Grid>
          <Grid item>
            <Button
              disableFocusRipple
              disableRipple
              className={classes.button}
              variant="text"
              color="primary"
            >
              Forgot password ?
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" className={classes.marginTop}>
          {' '}
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>{' '}
          &nbsp;
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleSubmit}
          >
            Login
          </Button>
        </Grid>
      </div>
    </Paper>
  );
};

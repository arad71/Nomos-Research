import * as React from 'react';
import { ReactElement } from 'react';
import { Card, Box, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import makeStyles from '@mui/styles/makeStyles';

interface Props {
  icon: ReactElement;
  to: string;
  title?: string;
  subtitle?: string | number;
  children?: ReactNode;
}

const useStyles = makeStyles(() => ({
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  icon: {
    background: '#E9EDEA',
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    padding: '1rem',
  },
}));

const CardWithIcon = (props: Props) => {
  const classes = useStyles();
  const { icon, title, subtitle, to, children } = props;
  return (
    <Card>
      <Link className={classes.link} to={to}>
        <Box
          sx={{
            overflow: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}
        >
          <div className={classes.icon}>{icon}</div>
          <Box className={classes.text} textAlign="right">
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            <Typography color="textSecondary">{subtitle}</Typography>
          </Box>
        </Box>
      </Link>
      {children && <Divider />}
      {children}
    </Card>
  );
};

export default CardWithIcon;

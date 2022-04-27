import * as React from 'react';
import { ReactElement } from 'react';
import { Card, Box, Typography, Divider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
  icon: ReactElement;
  to: string;
  title?: string;
  subtitle?: string | number;
  children?: ReactNode;
}

const useStyles = makeStyles(() => ({
  card: {
    border: '1px solid #D3D3D3',
    borderRadius: '20px',
    height: '90px',
    backgroundImage:
      'linear-gradient(to right, #E9EDEA 20%, rgba(0,0,0,0) 20%)',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  icon: {
    paddingLeft: '8px',
  },
}));

const CardWithIcon = (props: Props) => {
  const classes = useStyles();
  const { icon, title, subtitle, to, children } = props;
  return (
    <Card className={classes.card}>
      <Link className={classes.link} to={to}>
        <Box
          sx={{
            overflow: 'inherit',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className={classes.icon}>{icon}</div>
          <Box textAlign="right">
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

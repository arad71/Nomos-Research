import * as React from 'react';
import { ReactElement } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Card, Box, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import makeStyles from 'lib/makeStyles';

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
    background: 'linear-gradient(180deg, #f4f4f5 0%, #e4e4e7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '72px',
  },
  text: {
    padding: '1rem',
    flex: 1,
  },
  card: {
    borderRadius: '20px',
    border: '1px solid #e4e4e7',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.07)',
  },
  chevron: {
    color: '#71717a',
    paddingRight: '1rem',
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            minHeight: '112px',
          }}
        >
          <div className={classes.icon}>{icon}</div>
          <Box className={classes.text}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography color="textSecondary">{subtitle}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <ChevronRightIcon className={classes.chevron} />
          </Box>
        </Box>
      </Link>
      {children && <Divider />}
      {children}
    </Card>
  );
};

export default CardWithIcon;

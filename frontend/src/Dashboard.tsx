// in src/Dashboard.js
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import makeStyles from 'lib/makeStyles';
import { Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CardWithIcon from './CardWithIcon';
import { usePermissions } from 'react-admin';

const useStyles = makeStyles(() => ({
  cardtitle: {
    padding: '0 0 10px 0',
  },
  cardtext: {
    padding: '0px 40vw 20px 0px',
  },
  card: {
    background: 'linear-gradient(to right bottom, #2d5432, #112113)',
    borderRadius: '10px',
    color: 'white',
    padding: '10px',
    marginTop: '1rem',
  },
  cardbutton: {
    backgroundColor: '#fff',
    color: 'black',
    marginRight: '20px',
  },
  wrapper: {
    paddingTop: '20px',
    display: 'grid',
    gridAutoFlow: 'row',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: '10px',
    rowGap: '1em',
  },
  arrowPadding: {
    padding: '1rem',
  },
}));

const Dashboard = () => {
  const { isLoading } = usePermissions();
  const classes = useStyles();
  const roles = (localStorage.getItem('scopes') || '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);
  const hasRole = (role: string) => roles.includes(role);

  return !isLoading ? (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h4" className={classes.cardtitle}>
            Welcome to Nomos taxonomic names register
          </Typography>
          {hasRole('SUPER_ADMIN') ||
          hasRole('APPLICATION_SUPPORT') ||
          hasRole('MANAGER') ||
          hasRole('OFFICER') ||
          hasRole('READER') ? (
            <Button
              href="/#/taxon_names"
              variant="contained"
              color="secondary"
              className={classes.cardbutton}
            >
              View Names
            </Button>
          ) : (
            ''
          )}
          {hasRole('SUPER_ADMIN') ||
          hasRole('APPLICATION_SUPPORT') ||
          hasRole('MANAGER') ? (
            <Button
              href="/#/publications"
              variant="contained"
              color="secondary"
              className={classes.cardbutton}
            >
              View Publications
            </Button>
          ) : (
            ''
          )}
        </CardContent>
      </Card>
      <div className={classes.wrapper}>
        {hasRole('SUPER_ADMIN') || hasRole('APPLICATION_SUPPORT') ? (
          <CardWithIcon
            icon={
              <ArrowForwardIcon
                fontSize={'large'}
                className={classes.arrowPadding}
              />
            }
            to={'/users/create'}
            title="Add User"
            subtitle="Create a new Nomos user"
          />
        ) : (
          ''
        )}
        {hasRole('SUPER_ADMIN') ||
        hasRole('APPLICATION_SUPPORT') ||
        hasRole('MANAGER') ||
        hasRole('OFFICER') ? (
          <CardWithIcon
            icon={
              <ArrowForwardIcon
                fontSize={'large'}
                className={classes.arrowPadding}
              />
            }
            to={'/taxon_names/create'}
            title="Add Name"
            subtitle="Create a new Taxon name"
          />
        ) : (
          ''
        )}
        {hasRole('SUPER_ADMIN') ||
        hasRole('APPLICATION_SUPPORT') ||
        hasRole('MANAGER') ||
        hasRole('OFFICER') ? (
          <CardWithIcon
            icon={
              <ArrowForwardIcon
                fontSize={'large'}
                className={classes.arrowPadding}
              />
            }
            to={'/authors/create'}
            title="Add Author"
            subtitle="Create a new Author"
          />
        ) : (
          ''
        )}
        {hasRole('SUPER_ADMIN') ||
        hasRole('APPLICATION_SUPPORT') ||
        hasRole('MANAGER') ||
        hasRole('OFFICER') ? (
          <CardWithIcon
            icon={
              <ArrowForwardIcon
                fontSize={'large'}
                className={classes.arrowPadding}
              />
            }
            to={'/publications/create'}
            title="Add Publication"
            subtitle="Create a new Publication"
          />
        ) : (
          ''
        )}
        {hasRole('SUPER_ADMIN') ||
        hasRole('APPLICATION_SUPPORT') ||
        hasRole('MANAGER') ||
        hasRole('OFFICER') ? (
          <CardWithIcon
            icon={
              <ArrowForwardIcon
                fontSize={'large'}
                className={classes.arrowPadding}
              />
            }
            to={'/conscode_taxons/create'}
            title="Add Conservation Status"
            subtitle="Add a conservation status to a taxon name"
          />
        ) : (
          ''
        )}
      </div>
    </div>
  ) : (
    ''
  );
};

export default Dashboard;

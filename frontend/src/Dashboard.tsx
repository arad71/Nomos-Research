// in src/Dashboard.js
import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import CardWithIcon from './CardWithIcon';
import { WithPermissions } from '@react-admin/ra-rbac';

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
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: '10px',
    rowGap: '1em',
  },
  arrowPadding: {
    padding: '1rem',
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h4" className={classes.cardtitle}>
            Welcome to Nomos taxonomic names register
          </Typography>
          <WithPermissions resource="taxon_names" action="list">
            <Button
              href="/#/taxon_names"
              variant="contained"
              color="secondary"
              className={classes.cardbutton}
            >
              View Names
            </Button>
          </WithPermissions>
          <WithPermissions resource="publications" action="list">
            <Button
              href="/#/publications"
              variant="contained"
              color="secondary"
              className={classes.cardbutton}
            >
              View Publications
            </Button>
          </WithPermissions>
        </CardContent>
      </Card>
      <WithPermissions resource="users" action="create">
        <div className={classes.wrapper}>
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
        </div>
      </WithPermissions>
      <WithPermissions resource="taxon_names" action="create">
        <div className={classes.wrapper}>
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
        </div>
      </WithPermissions>
      <WithPermissions resource="authors" action="create">
        <div className={classes.wrapper}>
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
        </div>
      </WithPermissions>
      <WithPermissions resource="publications" action="create">
        <div className={classes.wrapper}>
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
        </div>
      </WithPermissions>
    </div>
  );
};

export default Dashboard;

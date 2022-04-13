// in src/Dashboard.js
import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
    paddingBottom: '100px',
  },
  cardbutton: {
    marginRight: '10px',
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h4" className={classes.cardtitle}>
          Welcome to Nomos taxonomic names register
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard;

// in src/Dashboard.js
import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  cardtitle: {
    padding: "0 0 10px 0"
  },
  cardtext: {
    padding: "0px 40vw 20px 0px"
  },
  card:{
    background: 'linear-gradient(to right bottom, #2d5432, #112113)',
    borderRadius: "10px",
    color: "white",
    padding: "10px"
  },
  cardbutton:{
    marginRight: "10px"
  }
}));

const DashBoard = () => {
  const classes = useStyles();
  return (
    <Card className={classes.card} >
      <CardContent>
        <Typography variant="h4" className={classes.cardtitle}>Welcome to Nomos taxonomic names register</Typography>
        <Typography variant="h6" className={classes.cardtext}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at egestas ante. Phasellus in euismod nunc. Donec sed augue a lacus ultricies mattis. Fusce molestie felis sit amet ultrices sollicitudin. Vestibulum nec velit sapien.</Typography>
        <Button href="/#/taxon_names" variant="contained" color="secondary" className={classes.cardbutton}>
          View Names
        </Button>
        <Button href="/#/publications"  variant="contained" color="primary" className={classes.cardbutton}>
          View Publications
        </Button>
        <Button href="/#/citations"  variant="contained" color="secondary" className={classes.cardbutton}>
          View Citations
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashBoard;

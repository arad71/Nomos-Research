import React from 'react';
import { Box, Card, Typography } from '@material-ui/core';
import {
  DateField,
  ReferenceField,
  SimpleShowLayout,
  TextField,
  Labeled,
} from 'react-admin';
import TaxonNameInformalGroups from '../Taxon_names/TaxonNameInformalGroups';
import TaxonHierarchy from '../Taxon_names/TaxonHierarchy';
import { useLocation } from 'react-router-dom';
import { GlobalTheme } from '../../GlobalTheme';
import { makeStyles } from '@material-ui/core/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import grey from '@material-ui/core/colors/grey';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    width: '130%',
    gridColumnGap: '1.5em',
    gridRowGap: '1.5em',
  },
  asideWidth: {
    width: '30%',
    margin: '0 0 1em 1em',
  },
  asidePadding: {
    paddingLeft: '0.5em',
  },
  iconStyles: {
    marginRight: '0.5em',
    fontSize: '0.9em',
    color: grey[500],
  },
  labelMargin: {
    marginTop: '0.2em',
    marginBottom: '0',
    fontSize: '0.5em',
  },
  panelSection: {
    [theme.breakpoints.up('xs')]: {
      display: 'block',
    },
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
    justifyContent: 'flex-start',
  },
}));

const Aside = () => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const location = useLocation();
  const currPath = location.pathname.split('/')[1];
  const isTaxonNames = currPath == 'taxon_names';
  return (
    <Box className={classes.asideWidth}>
      <Card className={classes.asidePadding}>
        <SimpleShowLayout>
          <Typography variant="h5" className={globalClasses.bold} gutterBottom>
            History
          </Typography>
          <Box className={classes.mainGrid}>
            <Box className={classes.panelSection}>
              <CalendarTodayIcon className={classes.iconStyles} />
              <Labeled label="Created on" className={classes.labelMargin}>
                <DateField source="created_on" />
              </Labeled>
            </Box>
            <Box className={classes.panelSection}>
              <PeopleAltIcon className={classes.iconStyles} />
              <ReferenceField
                source="created_by"
                reference="users"
                label="Created"
                link="show"
              >
                <Labeled label="Created by" className={classes.labelMargin}>
                  <TextField source="full_name" />
                </Labeled>
              </ReferenceField>
            </Box>
            <Box className={classes.panelSection}>
              <CalendarTodayIcon className={classes.iconStyles} />
              <Labeled label="Updated on" className={classes.labelMargin}>
                <DateField source="updated_on" />
              </Labeled>
            </Box>
            <Box className={classes.panelSection}>
              <PeopleAltIcon className={classes.iconStyles} />
              <ReferenceField source="updated_by" reference="users" link="show">
                <Labeled label="Updated by" className={classes.labelMargin}>
                  <TextField source="full_name" />
                </Labeled>
              </ReferenceField>
            </Box>
          </Box>
        </SimpleShowLayout>
      </Card>
      {isTaxonNames && (
        <>
          <TaxonNameInformalGroups />
          <TaxonHierarchy />
        </>
      )}
    </Box>
  );
};

export default Aside;

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import {
  DateField,
  ReferenceField,
  SimpleShowLayout,
  TextField,
  Labeled,
  useRecordContext,
  useResourceContext,
} from 'react-admin';
import TaxonNameInformalGroups from '../Taxon_names/TaxonNameInformalGroups';
import TaxonNameConscode from '../Taxon_names/TaxonNameConscode';
import TaxonHierarchy from '../Taxon_names/TaxonHierarchy';
import { useLocation } from 'react-router-dom';
import { GlobalTheme } from '../../GlobalTheme';
import makeStyles from '@mui/styles/makeStyles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import grey from '@mui/material/colors/grey';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { IfCanAccess } from '@react-admin/ra-rbac';
const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    width: '130%',
    gridColumnGap: '1.5em',
    gridRowGap: '1.5em',
  },
  deleted: {
    color: '#ff0000',
    verticalAlign: 'middle',
    display: 'inline-flex',
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

const Aside = (props: any) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const location = useLocation();
  const currPath = location.pathname.split('/')[1];
  const isTaxonNames =
    currPath == 'taxon_names' || currPath == 'taxon_names_code';
  const isHierarchy =
    currPath == 'taxon_names' ||
    currPath == 'taxon_names_code' ||
    currPath == 'hierarchies';
  const record = useRecordContext();
  const resource = useResourceContext();
  const deleted =
    record && record.deleted ? (
      <Typography variant="subtitle1" className={classes.deleted}>
        <DeleteIcon />
        Deleted
      </Typography>
    ) : null;
  return (
    <Box className={classes.asideWidth}>
      <Card className={classes.asidePadding}>
        <SimpleShowLayout>
          <Box className={classes.mainGrid}>
            <Box>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                History
              </Typography>
            </Box>
            <IfCanAccess resource={resource} action="viewdeleted">
              <Box>{deleted}</Box>
            </IfCanAccess>
          </Box>
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
      {isTaxonNames && <TaxonNameInformalGroups />}
      {isTaxonNames && <TaxonNameConscode />}
      {isHierarchy && <TaxonHierarchy {...props} />}
    </Box>
  );
};

export default Aside;

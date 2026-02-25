import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  Labeled,
  ReferenceField,
  ChipField,
  ReferenceManyField,
  SingleFieldList,
  Datagrid,
  TextField,
} from 'react-admin';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
});

const TaxonNameInformalGroups = () => {
  const classes = useStyles();
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" className={classes.bold} gutterBottom>
          Informal Groups
        </Typography>
      </Box>
      <ReferenceManyField reference="informal_groups" target="taxon_name_id">
        <SingleFieldList>
          <ReferenceField
            source="classification_system_id"
            reference="classification_systems"
            link="show"
            allowEmpty
          >
            <ChipField source="class_desc" />
          </ReferenceField>
        </SingleFieldList>
      </ReferenceManyField>
    </Box>
  );
};

export default TaxonNameInformalGroups;

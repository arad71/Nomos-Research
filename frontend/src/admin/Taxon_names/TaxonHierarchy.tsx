import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Datagrid,
  ReferenceField,
  ReferenceManyField,
  RichTextField,
  TextField,
} from 'react-admin';
import { Box, Typography } from '@material-ui/core';
import { hierarchyRowClick } from './HierarchyRowClick';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
});

const TaxonHierarchy = () => {
  const classes = useStyles();
  return (
    <Box mt="1.2em">
      <Box mt="2.2em">
        <Typography variant="h5" className={classes.bold} gutterBottom>
          Taxon Hierarchy
        </Typography>
      </Box>
      <ReferenceManyField
        reference="hierarchies"
        target="path__ancestor_of"
        source="path"
        sort={{ field: 'path', order: 'ASC' }}
      >
        <Datagrid rowClick={hierarchyRowClick}>
          <TextField
            source="rank_name"
            sortBy="taxon_name___taxon_rank___rank_name"
            label="Rank"
          />
          <ReferenceField
            source="taxon_name_id"
            reference="taxon_names"
            link={false}
            sortBy="taxon_name___scientific_name"
          >
            <RichTextField source="formatted_scientific_name" />
          </ReferenceField>
        </Datagrid>
      </ReferenceManyField>
    </Box>
  );
};

export default TaxonHierarchy;

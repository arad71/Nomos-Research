import { ReferenceInput, required, SelectInput, SimpleForm } from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const HierarchyCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="hierarchies" />}
      warnWhenUnsavedChanges
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Hierarchy
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ReferenceInput source="taxon_name_id" reference="taxon_names">
            <SelectInput optionText="scientific_name" validate={required()} />
          </ReferenceInput>
        </Box>
        <Box>
          <ReferenceInput
            source="classification_system_id"
            reference="classification_systems"
          >
            <SelectInput optionText="class_desc" validate={required()} />
          </ReferenceInput>
        </Box>
        <Box>
          <ReferenceInput source="parent_nid" reference="taxon_names">
            <SelectInput optionText="scientific_name" validate={required()} />
          </ReferenceInput>
        </Box>
      </Box>
    </SimpleForm>
  );
};

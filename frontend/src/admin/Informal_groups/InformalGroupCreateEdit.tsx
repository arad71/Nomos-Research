import { ReferenceInput, required, SelectInput, SimpleForm } from 'react-admin';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    width: '50%',
    gridColumnGap: '1.5em',
  },
}));

export const InformalGroupCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm {...props} warnWhenUnsavedChanges>
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Informal Group
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <ReferenceInput
          source="classification_system_id"
          reference="classification_systems"
        >
          <SelectInput optionText="class_desc" validate={required()} />
        </ReferenceInput>
        <ReferenceInput source="taxon_name_id" reference="taxon_names">
          <SelectInput optionText="scientific_name" validate={required()} />
        </ReferenceInput>
      </Box>
    </SimpleForm>
  );
};

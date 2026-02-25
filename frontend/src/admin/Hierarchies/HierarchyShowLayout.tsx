import React from 'react';
import {
  ReferenceField,
  RichTextField,
  SimpleShowLayout,
  Labeled,
  TextField,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';

import { GlobalTheme } from '../../GlobalTheme';
const useStyles = makeStyles((theme: any) => ({
  showPad: {
    padding: '8px 16px',
  },
}));
export const HierarchyShowLayout = () => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <SimpleShowLayout>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Hierarchy
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Classification System">
              <ReferenceField
                source="classification_system_id"
                reference="classification_systems"
                link="show"
              >
                <TextField source="class_desc" />
              </ReferenceField>
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Parent name">
              <ReferenceField
                source="parent_nid"
                reference="taxon_names"
                label="Parent name"
                link="show"
              >
                <RichTextField source="formatted_scientific_name" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Taxon name">
              <ReferenceField
                source="taxon_name_id"
                reference="taxon_names"
                link="show"
              >
                <RichTextField source="formatted_scientific_name" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
      </Box>
    </SimpleShowLayout>
  );
};

import React, { FC } from 'react';
import { RichTextField, ReferenceField, Labeled, TextField } from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const HierarchyShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Classification system
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Taxon Name">
              <ReferenceField source="taxon_name_id" reference="taxon_names">
                <RichTextField source="formatted_scientific_name" />
              </ReferenceField>
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Author">
              <ReferenceField
                source="classification_system_id"
                reference="classification_systems"
              >
                <TextField source="class_desc" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Author Type">
              <ReferenceField source="parent_nid" reference="taxon_names">
                <RichTextField source="formatted_scientific_name" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};

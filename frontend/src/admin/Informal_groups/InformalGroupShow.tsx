import React, { FC } from 'react';
import { ReferenceField, RichTextField, Labeled, TextField } from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const InformalGroupShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title="Informal group">
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Informal Group
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Classification description">
              <ReferenceField
                source="classification_system_id"
                reference="classification_systems"
                link="show"
              >
                <TextField source="class_desc" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Taxon Name">
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
    </Show>
  );
};

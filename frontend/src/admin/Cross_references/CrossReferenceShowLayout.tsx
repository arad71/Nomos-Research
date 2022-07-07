import {
  BooleanField,
  ReferenceField,
  SelectField,
  TextField,
  Labeled,
  SimpleShowLayout,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Show } from '@react-admin/ra-rbac';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import CrossRefType from './CrossRefType';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import Aside from '../shared/Aside';
import { Box, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const CrossReferenceShowLayout: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Box className={classes.showPad}>
      <Typography variant="h5" className={globalClasses.bold} gutterBottom>
        Cross Reference
      </Typography>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Old name">
            <ReferenceField
              source="old_name_id"
              reference="taxon_names"
              link="show"
            >
              <FormattedScientificNameWithStatus />
            </ReferenceField>
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="New name">
            <ReferenceField
              source="new_name_id"
              reference="taxon_names"
              link="show"
            >
              <FormattedScientificNameWithStatus />
            </ReferenceField>
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Cross reference type">
            <SelectField source="cross_reference_type" choices={CrossRefType} />
          </Labeled>
        </Box>
      </Box>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Authorised by">
            <TextField source="authorised_by" />
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Comments">
            <TextField source="reference_comments" />
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Notes">
            <TextField source="notes" />
          </Labeled>
        </Box>
      </Box>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Active">
            <BooleanField source="active" />
          </Labeled>
        </Box>
      </Box>
    </Box>
  );
};

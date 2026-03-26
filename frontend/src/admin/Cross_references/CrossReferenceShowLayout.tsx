import {
  ReferenceField,
  SelectField,
  TextField,
  Labeled,
} from 'react-admin';
import makeStyles from 'lib/makeStyles';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
import CrossRefType from '../../kit/shared/choices/CrossRefType';
import React, { FC } from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';

const useStyles = makeStyles((theme: any) => ({
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
        Related name
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
    </Box>
  );
};

import React, { FC } from 'react';
import {
  Labeled,
  TextField,
  BooleanField,
  SelectField,
  ReferenceField,
  ReferenceManyField,
} from 'react-admin';
import makeStyles from '@mui/styles/makeStyles';
import { Show } from 'react-admin';
import { Box, Typography } from '@mui/material';
import Aside from '../shared/Aside';
import ConservationType from './ConservationType';
import { GlobalTheme } from '../../GlobalTheme';
import { ConservationDescription } from './ConservationDescription';
import { ConscodeTaxonReferenceManyGridTaxon } from '../Conscode_taxons';
import { DateField } from 'react-admin';

const useStyles = makeStyles((theme: any) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const ConservationCodesShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title={<ConservationDescription />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Conservation code
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Conservation code ">
              <TextField source="conservation_code_value" />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Authority">
              <TextField source="authorising_org" choices={ConservationType} />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Display order">
              <TextField source="code_priority" />
            </Labeled>
          </Box>
        </Box>
        <ReferenceField
          source="taxon_name_id"
          reference="conscode_taxons"
          link="show"
        >
          <Labeled label="Taxon">
            <TextField source="taxon_name_id" />
          </Labeled>
        </ReferenceField>
      </Box>
    </Show>
  );
};

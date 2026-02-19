import React, { FC } from 'react';
import {
  ReferenceField,
  RichTextField,
  Labeled,
  TextField,
  DateField,
} from 'react-admin';
import { Show } from 'react-admin';
import Aside from '../shared/Aside';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: any) => ({
  showPad: {
    padding: '8px 16px',
  },
  showRow: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
    gap: '1.5em',
  },
}));

export const ConscodeTaxonShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show
      aside={<Aside />}
      {...props}
      title="Conservation code - taxon name link"
    >
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Conservation code Taxon link
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Formatted Taxon Name">
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

        <Box className={classes.showRow}>
          <Labeled label="Authority">
            <ReferenceField
              source="conservation_code_id"
              reference="conservation_codes"
              link={false}
            >
              <TextField source="authorising_org" />
            </ReferenceField>
          </Labeled>
          <Labeled label="Conservation code">
            <ReferenceField
              source="conservation_code_id"
              reference="conservation_codes"
              link={false}
            >
              <TextField source="conservation_code_value" />
            </ReferenceField>
          </Labeled>

          <Labeled label="Effective from">
            <DateField source="effective_from" />
          </Labeled>
          <Labeled label="Effective to">
            <DateField source="effective_to" />
          </Labeled>
        </Box>
        <br />
        <br />
        <Box className={globalClasses.formRow}>
          <Labeled label="Notes">
            <TextField source="notes" />
          </Labeled>
        </Box>
      </Box>
    </Show>
  );
};

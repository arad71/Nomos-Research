import React from 'react';
import {
  NumberField,
  ReferenceField,
  RichTextField,
  Labeled,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import LanguageType from './LanguageType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const VernacularShowLayout = () => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Box className={classes.showPad}>
      <Typography variant="h5" className={globalClasses.bold} gutterBottom>
        Vernacular Name
      </Typography>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Vernacular">
            <TextField source="vernacular_name" />
          </Labeled>
        </Box>
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
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Language">
            <SelectField source="language" choices={LanguageType} />
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Preferred language">
            <BooleanField source="lang_pref" />
          </Labeled>
        </Box>
      </Box>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Source">
            <TextField source="source" />
          </Labeled>
        </Box>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Sort order">
            <NumberField source="sort_order" />
          </Labeled>
        </Box>
      </Box>
      <Box className={globalClasses.formRow}>
        <Box className={globalClasses.fieldMargin}>
          <Labeled label="Preferred">
            <BooleanField source="preferred" />
          </Labeled>
        </Box>
      </Box>
    </Box>
  );
};

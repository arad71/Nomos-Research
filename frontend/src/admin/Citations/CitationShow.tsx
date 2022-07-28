import React, { FC } from 'react';
import {
  Labeled,
  NumberField,
  ReferenceField,
  RichTextField,
  SelectField,
  TextField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import { makeStyles } from '@material-ui/core/styles';
import AuthorType from './AuthorType';
import Aside from '../shared/Aside';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const CitationShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} title="Citation" {...props}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Citation
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
              <ReferenceField source="author_id" reference="authors">
                <TextField source="abbreviation" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Author Type">
              <SelectField source="author_type" choices={AuthorType} />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Author order">
              <NumberField source="author_order" />
            </Labeled>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};

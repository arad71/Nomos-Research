import {
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  AutocompleteInput,
  minValue,
} from 'react-admin';
import React, { FC } from 'react';
import AuthorType from '../../kit/shared/choices/AuthorType';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';
import EditToolbar from '../shared/EditToolbar';
import ScientificNameReference from '../Taxon_names/ScientificNameReference';

const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const CitationCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="citations" />}
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Citation
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ScientificNameReference
            source="taxon_name_id"
            validate={required()}
          />
        </Box>
        <Box>
          <ReferenceInput
            source="author_id"
            reference="authors"
            sort={{ field: 'abbreviation', order: 'ASC' }}
            perPage={100}
          >
            <AutocompleteInput
              optionText="abbreviation"
              resettable
              validate={required()}
            />
          </ReferenceInput>
        </Box>
        <Box>
          <SelectInput source="author_type" choices={AuthorType} />
        </Box>
        <Box>
          <NumberInput
            source="author_order"
            validate={[required(), minValue(0)]}
            defaultValue={0}
            min={0}
            fullWidth
          />
        </Box>
      </Box>
    </SimpleForm>
  );
};

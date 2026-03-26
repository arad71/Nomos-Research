import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
  AutocompleteInput,
} from 'react-admin';
import React, { FC } from 'react';
import RankAbbreviation from '../../kit/shared/choices/RankAbbreviation';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography } from '@mui/material';
import makeStyles from 'lib/makeStyles';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme: any) => ({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '70%',
    gridColumnGap: '1.5em',
  },
}));

export const TaxonRankCreateEdit: FC = (props) => {
  const globalClasses = GlobalTheme();
  const classes = useStyles();
  return (
    <SimpleForm
      {...props}
      toolbar={<EditToolbar resource="taxon_ranks" />}
    >
      <Box>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Taxon rank
        </Typography>
      </Box>
      <Box className={classes.mainGrid}>
        <Box>
          <ReferenceInput
            label="Kingdom"
            source="kingdom_id"
            reference="kingdoms"
            fullWidth
          >
            <SelectInput optionText="kingdom_name" validate={[required()]} />
          </ReferenceInput>
        </Box>
        <Box>
          <TextInput source="rank_name" validate={[required()]} fullWidth />
        </Box>
        <SelectInput source="rank_abbrev" choices={RankAbbreviation} />
        <Box>
          <ReferenceInput
            label="Direct Parent Rank"
            source="direct_parent_rank_id"
            reference="taxon_ranks"
            fullWidth
          >
            <AutocompleteInput optionText="rank_name" resettable />
          </ReferenceInput>
        </Box>
        <Box>
          <ReferenceInput
            label="Req Parent Rank"
            source="required_parent_rank_id"
            reference="taxon_ranks"
            fullWidth
          >
            <AutocompleteInput optionText="rank_name" resettable />
          </ReferenceInput>
        </Box>
        <Box>
          <BooleanInput source="uninomial" defaultValue={false} />
        </Box>
      </Box>
    </SimpleForm>
  );
};

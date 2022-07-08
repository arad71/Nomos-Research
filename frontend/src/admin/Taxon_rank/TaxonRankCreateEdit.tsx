import {
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanInput,
} from 'react-admin';
import React, { FC } from 'react';
import RankAbbreviation from './RankAbbreviation';
import { GlobalTheme } from '../../GlobalTheme';
import { Box, Typography, makeStyles } from '@material-ui/core';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles((theme) => ({
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
      warnWhenUnsavedChanges
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
            <SelectInput optionText="rank_name" />
          </ReferenceInput>
        </Box>
        <Box>
          <ReferenceInput
            label="Req Parent Rank"
            source="required_parent_rank_id"
            reference="taxon_ranks"
            fullWidth
          >
            <SelectInput optionText="rank_name" />
          </ReferenceInput>
        </Box>
        <Box>
          <BooleanInput source="uninomial" defaultValue={false} />
        </Box>
      </Box>
    </SimpleForm>
  );
};

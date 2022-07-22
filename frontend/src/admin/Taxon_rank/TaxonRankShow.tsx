import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  required,
  Labeled,
  SelectField,
  TextField,
  BooleanField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import RankAbbreviation from './RankAbbreviation';
import { GlobalTheme } from '../../GlobalTheme';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { RankName } from './RankName';

const useStyles = makeStyles((theme) => ({
  showPad: {
    padding: '8px 16px',
  },
}));

export const TaxonRankShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props} title={<RankName />}>
      <Box className={classes.showPad}>
        <Typography variant="h5" className={globalClasses.bold} gutterBottom>
          Taxon Rank
        </Typography>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Kingdom">
              <ReferenceField
                label="Kingdom"
                source="kingdom_id"
                reference="kingdoms"
              >
                <TextField source="kingdom_name" />
              </ReferenceField>
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Rank name">
              <TextField source="rank_name" validate={[required()]} />
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Rank abbreviation">
              <SelectField source="rank_abbrev" choices={RankAbbreviation} />
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Direct Parent rank">
              <ReferenceField
                label="Direct Parent Rank"
                source="direct_parent_rank_id"
                reference="taxon_ranks"
              >
                <NumberField source="rank_name" />
              </ReferenceField>
            </Labeled>
          </Box>
        </Box>
        <Box className={globalClasses.formRow}>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Req. Parent rank">
              <ReferenceField
                label="Req Parent Rank"
                source="required_parent_rank_id"
                reference="taxon_ranks"
              >
                <NumberField source="rank_name" />
              </ReferenceField>
            </Labeled>
          </Box>
          <Box className={globalClasses.fieldMargin}>
            <Labeled label="Uninomial">
              <BooleanField source="uninomial" />
            </Labeled>
          </Box>
        </Box>
      </Box>
    </Show>
  );
};

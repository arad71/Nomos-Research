import React, { FC } from 'react';
import {
  BooleanField,
  ChipField,
  Labeled,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  SingleFieldList,
  Tab,
  TabbedShowLayout,
  TextField,
  useRecordContext,
} from 'react-admin';
import { Show } from 'react-admin';
import Aside from '../shared/Aside';
import NaturalisedStatus from '../Taxon_names/NaturalisedStatus';
import PublicationStatus from '../Taxon_names/PublicationStatus';
import makeStyles from '@mui/styles/makeStyles';
import { Box, Typography } from '@mui/material';
import { GlobalTheme } from '../../GlobalTheme';
import { ConscodeTaxonReferenceManyGrid } from '../Conscode_taxons';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from '../Taxon_names/FormattedScientificNameWithStatus';
import { NamePageSummary } from '../Taxon_names/NamePageSummary';
import PostShowActions from '../shared/PostShowActions';
import NestedLinkField from '../shared/NestedLinkField';
import { TaxonName } from '../Taxon_names/TaxonName';

const useStyles = makeStyles(() => ({
  bottomPadding: {
    paddingBottom: '1.5em',
  },
  fullWidth: {
    width: '100%',
    gridColumn: '1 / 9',
  },
  showPad: {
    padding: '16px',
  },
}));

const Empty = () => {
  const record: TaxonName = useRecordContext();
  if (record.classification_system_ids.length != 0) return null;
  return (
    <Box>
      <Typography variant="body1">
        Not yet related to any Informal Groups
      </Typography>
    </Box>
  );
};

export const TaxonNameCodeShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();

  return (
    <Show
      actions={<PostShowActions />}
      title={<FormattedScientificNameWithStatus truncate />}
      aside={<Aside />}
      {...props}
    >
      <>
        <NamePageSummary />
        <Box className={classes.showPad}>
          <Box className={classes.fullWidth}>
            <Labeled label="Taxon name">
              <FormattedScientificNameWithStatus />
            </Labeled>
            <br />
            <br />

            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Kingdom" {...props}>
                  <NestedLinkField
                    source="kingdom"
                    reference="kingdoms"
                    sortBy="kingdom___kingdom_name"
                    idKey="kingdom_id"
                    labelKey="kingdom_name"
                  />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Rank">
                  <NestedLinkField
                    source="taxon_rank"
                    reference="taxon_ranks"
                    sortBy="taxon_rank___rank_name"
                    idKey="taxon_rank_id"
                    labelKey="rank_name"
                  />
                </Labeled>
              </Box>
            </Box>

            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Publication status">
                  <SelectField
                    source="publication_status"
                    choices={PublicationStatus}
                  />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Is current">
                  <BooleanField source="is_current" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Validated">
                  <BooleanField source="validated" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Legacy ID" {...props}>
                  <TextField source="legacy_id" />
                </Labeled>
              </Box>
            </Box>

            {/* Conservation Codes Section */}
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Conservation codes
              </Typography>
            </Box>
            <Box className={classes.bottomPadding}>
              <ConscodeTaxonReferenceManyGrid
                props={props}
                source="conscode_taxon_id"
                target="taxon_name_id"
                label="Conservation code"
              />
            </Box>
          </Box>
        </Box>
      </>
    </Show>
  );
};

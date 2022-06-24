import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  Labeled,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  Tab,
  TabbedShowLayout,
  TextField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { CrossReferenceManyGrid } from '../Cross_references';
import { AuthorReferenceManyGrid } from '../Authors';
import { VernacularReferenceManyGrid } from '../Vernaculars';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';
import { NamePageSummary } from './NamePageSummary';
import AuthorType from '../Citations/AuthorType';

const useStyles = makeStyles((theme) => ({
  linedRow: {
    borderBottom: '1px solid #eee',
    marginTop: '1.2em',
  },
}));

export const TaxonNameShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show
      title={<FormattedScientificNameWithStatus />}
      aside={<Aside />}
      {...props}
    >
      <>
        <NamePageSummary />
        <TabbedShowLayout>
          <Tab label="Name" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Box className={globalClasses.fieldMargin}>
                <ReferenceField source="kingdom_id" reference="kingdoms">
                  <Labeled label="Kingdom">
                    <TextField source="kingdom_name" />
                  </Labeled>
                </ReferenceField>
                <ReferenceField source="rank_id" reference="taxon_ranks">
                  <Labeled label="Rank">
                    <TextField source="rank_name" />
                  </Labeled>
                </ReferenceField>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="genus">
                  <TextField source="genus" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Uninomial">
                  <TextField source="uninomial" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Specific Epithet">
                  <TextField source="specific_epithet" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Infraspecific Epithet">
                  <TextField source="infraspecific_epithet" />
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Day">
                  <NumberField source="form_desc_dy" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Month">
                  <NumberField source="form_desc_mn" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Year">
                  <TextField source="form_desc_yr" />
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
            </Box>
            {/* Authors Section */}
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Authors
              </Typography>
            </Box>
            <AuthorReferenceManyGrid
              props={props}
              source="author_id"
              target="taxon_name_id"
              label="Authors"
            />
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication
              </Typography>
            </Box>
            <Box my="1.2em">
              <ReferenceField source="publication_id" reference="publications">
                <Labeled label="Publication">
                  <TextField source="display_title" />
                </Labeled>
              </ReferenceField>
            </Box>
            {/* Vernacular Section */}
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Vernacular names
              </Typography>
            </Box>
            <VernacularReferenceManyGrid
              props={props}
              target="taxon_name_id"
              label="Vernaculars"
            />
          </Tab>
          <Tab label="Details" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Box className={globalClasses.sectionMargin}>
                <Typography
                  variant="h5"
                  className={globalClasses.bold}
                  gutterBottom
                >
                  Naturalised Status
                </Typography>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Naturalised status">
                  <SelectField
                    source="naturalised_status"
                    choices={NaturalisedStatus}
                  />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Naturalised certainty">
                  <BooleanField source="naturalised_certainty" />
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Naturalised comments">
                  <TextField source="naturalised_comments" />
                </Labeled>
              </Box>
            </Box>
          </Tab>
          <Tab label="Hierarchy" className={globalClasses.bold}></Tab>
          <Tab label="Related names" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Labeled label="Previous names">
                <CrossReferenceManyGrid
                  props={props}
                  source="old_name_id"
                  target="new_name_id"
                  label="Previous names"
                />
              </Labeled>
            </Box>
            <Box className={globalClasses.sectionMargin}>
              <Labeled label="Subsequent names">
                <CrossReferenceManyGrid
                  props={props}
                  source="new_name_id"
                  target="old_name_id"
                  label="Subsequent names"
                />
              </Labeled>
            </Box>
          </Tab>
          <Tab label="Notes" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Labeled label="Notes">
                <TextField source="comments" />
              </Labeled>
            </Box>
          </Tab>
        </TabbedShowLayout>
      </>
    </Show>
  );
};

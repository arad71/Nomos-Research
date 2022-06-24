import React, { FC } from 'react';
import {
  BooleanField,
  Datagrid,
  Labeled,
  NumberField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  RichTextField,
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
import { hierarchyRowClick } from './HierarchyRowClick';

const useStyles = makeStyles((theme) => ({
  bottomPadding: {
    paddingBottom: '1.5em',
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
            <Box className={classes.bottomPadding}>
              <VernacularReferenceManyGrid
                props={props}
                target="taxon_name_id"
                label="Vernaculars"
              />
            </Box>
          </Tab>
          <Tab label="Details" path="details" className={globalClasses.bold}>
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
          <Tab
            label="Hierarchy"
            path="hierarchy"
            className={globalClasses.bold}
          >
            <ReferenceManyField
              perPage={100}
              pagination={<Pagination rowsPerPageOptions={[]} />}
              reference="hierarchies"
              target="path__descendant_of"
              label="Child taxon names"
              source="path"
              sort={{ field: 'path', order: 'ASC' }}
              filter={{ taxon_name___scientific_name__gt: '' }}
            >
              <Datagrid
                rowClick={hierarchyRowClick}
                className={globalClasses.equalColumnWidth}
              >
                <TextField
                  source="rank_name"
                  sortBy="taxon_name___taxon_rank___rank_name"
                  label="Rank"
                />
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  link={false}
                >
                  <RichTextField source="formatted_scientific_name" />
                </ReferenceField>
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  label="Author"
                  sortBy="taxon_name___author"
                  link={false}
                >
                  <RichTextField source="author" />
                </ReferenceField>
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  label="Year"
                  sortBy="taxon_name___form_desc_yr"
                  link={false}
                >
                  <RichTextField source="form_desc_yr" />
                </ReferenceField>
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  label="Is current"
                  sortBy="taxon_name___is_current"
                  link={false}
                >
                  <BooleanField source="is_current" />
                </ReferenceField>
                <ReferenceField
                  source="taxon_name_id"
                  reference="taxon_names"
                  link={false}
                  label="Vernaculars"
                  sortBy="taxon_name___all_vernaculars"
                >
                  <TextField source="all_vernaculars" />
                </ReferenceField>
              </Datagrid>
            </ReferenceManyField>
          </Tab>
          <Tab
            label="Related names"
            path="related_names"
            className={globalClasses.bold}
          >
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
          <Tab label="Notes" path="notes" className={globalClasses.bold}>
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

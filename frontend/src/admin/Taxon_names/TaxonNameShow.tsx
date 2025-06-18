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
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';
import { CrossReferenceManyGrid } from '../Cross_references';
import { AuthorReferenceManyGrid } from '../Authors';
import { ConscodeTaxonReferenceManyGrid } from '../Conscode_taxons';
import { VernacularReferenceManyGrid } from '../Vernaculars';
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';
import { NamePageSummary } from './NamePageSummary';
import PostShowActions from '../shared/PostShowActions';
import NestedLinkField from '../shared/NestedLinkField';
import { HierarchyGrid } from './HierarchyGrid';
import { InfragenericNamesGrid } from './InfragenericNamesGrid';
import { TaxonName } from './TaxonName';

const useStyles = makeStyles(() => ({
  bottomPadding: {
    paddingBottom: '1.5em',
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

export const TaxonNameShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const ReviewReason = () => {
    // Output review reason if review has been set
    const record: TaxonName = useRecordContext();
    if (!record.review) return null;
    return (
      <Box className={globalClasses.fieldMargin}>
        <Labeled label="Review reason">
          <TextField source="review_reason" />
        </Labeled>
      </Box>
    );
  };

  return (
    <Show
      actions={<PostShowActions />}
      title={<FormattedScientificNameWithStatus truncate />}
      aside={<Aside />}
      {...props}
    >
      <>
        <NamePageSummary />
        <TabbedShowLayout>
          <Tab label="Name" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon Name
              </Typography>
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
            </Box>
            <Box className={globalClasses.formRow}>
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
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Is autonym?">
                  <BooleanField source="is_autonym" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Review?">
                  <BooleanField source="review" />
                </Labeled>
              </Box>
              <ReviewReason />
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

            {/* Publication Section */}
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
              <ReferenceField
                source="publication_id"
                reference="publications"
                link="show"
              >
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
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon name - Details
              </Typography>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Naturalised Status
              </Typography>
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
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Informal Groups
              </Typography>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Empty />
                <ReferenceManyField
                  reference="informal_groups"
                  target="taxon_name_id"
                >
                  <SingleFieldList>
                    <ReferenceField
                      source="classification_system_id"
                      reference="classification_systems"
                      link="show"
                      allowEmpty
                    >
                      <ChipField
                        source="class_desc"
                        emptyText="Not yet associated with any Informal Groups"
                      />
                    </ReferenceField>
                  </SingleFieldList>
                </ReferenceManyField>
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
          </Tab>
          <Tab
            label="Hierarchy"
            path="hierarchy"
            className={globalClasses.bold}
          >
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon Name - Hierarchy
              </Typography>
              <HierarchyGrid />
            </Box>
          </Tab>
          <Tab
            label="Related names"
            path="related_names"
            className={globalClasses.bold}
          >
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon Name - Related Names
              </Typography>
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
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon name - Notes
              </Typography>
              <Labeled label="Notes">
                <TextField source="comments" />
              </Labeled>
            </Box>
          </Tab>
          <Tab
            label="Name formats"
            path="formats"
            className={globalClasses.bold}
          >
            {/*Sub genera name*/}
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Taxon Name - Name formats
              </Typography>
            </Box>
            <InfragenericNamesGrid {...props} />
          </Tab>
        </TabbedShowLayout>
      </>
    </Show>
  );
};

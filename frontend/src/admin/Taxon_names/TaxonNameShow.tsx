import React, { FC } from 'react';
import {
  BooleanField,
  Labeled,
  NumberField,
  ReferenceField,
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
// eslint-disable-next-line max-len
import { FormattedScientificNameWithStatus } from './FormattedScientificNameWithStatus';
import { NamePageSummary } from './NamePageSummary';

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
                Authors (placeholder section)
              </Typography>
            </Box>
            <Box className={classes.linedRow}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Typography variant="body2" gutterBottom>
                    1
                  </Typography>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author">
                    <Typography variant="body2" gutterBottom>
                      Schodde
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author type">
                    <Typography variant="body2" gutterBottom>
                      Basionym
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Is active">
                    <BooleanField source="validated" />
                  </Labeled>
                </Box>
              </Box>
            </Box>
            <Box className={classes.linedRow}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Typography variant="body2" gutterBottom>
                    2
                  </Typography>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author">
                    <Typography variant="body2" gutterBottom>
                      Schodde
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author type">
                    <Typography variant="body2" gutterBottom>
                      Basionym
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Is active">
                    <BooleanField source="validated" />
                  </Labeled>
                </Box>
              </Box>
            </Box>
            <Box className={classes.linedRow}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Typography variant="body2" gutterBottom>
                    3
                  </Typography>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author">
                    <Typography variant="body2" gutterBottom>
                      Schodde
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Author type">
                    <Typography variant="body2" gutterBottom>
                      Basionym
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Is active">
                    <BooleanField source="validated" />
                  </Labeled>
                </Box>
              </Box>
            </Box>
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
              <ReferenceField source="publication_id" reference="publications">
                <Labeled label="Publication">
                  <TextField source="abbreviated_title" />
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
                Vernacular names (placeholder section)
              </Typography>
            </Box>
            <Box className={classes.linedRow}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Typography variant="body2" gutterBottom>
                    1
                  </Typography>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Name">
                    <Typography variant="body2" gutterBottom>
                      Red-tailed black cockatoo
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Name type">
                    <Typography variant="body2" gutterBottom>
                      Common
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Language">
                    <Typography variant="body2" gutterBottom>
                      English
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Preferred">
                    <Typography variant="body2" gutterBottom>
                      Enabled
                    </Typography>
                  </Labeled>
                </Box>
              </Box>
            </Box>
            <Box className={classes.linedRow}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Typography variant="body2" gutterBottom>
                    2
                  </Typography>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Name">
                    <Typography variant="body2" gutterBottom>
                      Red-tailed black cockatoo
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Name type">
                    <Typography variant="body2" gutterBottom>
                      Common
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Language">
                    <Typography variant="body2" gutterBottom>
                      English
                    </Typography>
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Preferred">
                    <Typography variant="body2" gutterBottom>
                      Enabled
                    </Typography>
                  </Labeled>
                </Box>
              </Box>
            </Box>
          </Tab>
          <Tab label="Details" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Box className={globalClasses.formRow}>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Family code">
                    <TextField source="family_code" />
                  </Labeled>
                </Box>
                <Box className={globalClasses.fieldMargin}>
                  <Labeled label="Origin">
                    <TextField source="origin" />
                  </Labeled>
                </Box>
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

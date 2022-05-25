import React, { FC } from 'react';
import {
  NumberField,
  ReferenceField,
  Show,
  TabbedShowLayout,
  Tab,
  SelectField,
  TextField,
  BooleanField,
  Labeled,
  RichTextField,
  useRecordContext,
} from 'react-admin';
import Aside from '../shared/Aside';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import green from '@material-ui/core/colors/green';
import { GlobalTheme } from '../../GlobalTheme';

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 'bold',
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  subtitle: {
    fontSize: '1em',
  },
  linedRow: {
    borderBottom: '1px solid #eee',
    marginTop: '1.2em',
  },
  titlePos: {
    position: 'absolute',
    top: '65px',
  },
}));

const TaxonNameStatus = () => {
  const record = useRecordContext();
  return record && record.is_current ? (
    <CheckCircleIcon style={{ color: green[500] }} />
  ) : null;
};

export const TaxonNameShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props}>
      <>
        <Box className={classes.titlePos}>
          <Box>
            <RichTextField
              className={classes.title}
              source="formatted_scientific_name"
            />
            <TaxonNameStatus />
          </Box>
          <ReferenceField source="rank_id" reference="taxon_ranks" link={false}>
            <TextField source="rank_name" className={classes.subtitle} />
          </ReferenceField>
        </Box>
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
          <Tab label="Heirarchy" className={globalClasses.bold}></Tab>
          <Tab label="Cross References" className={globalClasses.bold}></Tab>
          <Tab label="Notes" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Labeled label="Notes">
                <TextField source="notes" />
              </Labeled>
            </Box>
          </Tab>
        </TabbedShowLayout>
      </>
    </Show>
  );
};

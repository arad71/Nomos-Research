import React, { FC } from 'react';
import {
  ReferenceField,
  RichTextField,
  TextField,
  TabbedShowLayout,
  Tab,
  Labeled,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  FunctionField,
} from 'react-admin';
import { Show } from '@react-admin/ra-rbac';
import Aside from '../shared/Aside';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

export const PublicationShow: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <Show aside={<Aside />} {...props}>
      <>
        <Box className={classes.titlePos}>
          <Box>
            <RichTextField className={classes.title} source="display_title" />
          </Box>
          <FunctionField
            render={(record: any) => record.author_names.join(', ')}
            className={classes.subtitle}
          />
        </Box>
        <TabbedShowLayout>
          <Tab label="Publication" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication
              </Typography>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Title">
                  <TextField source="title" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Abbreviated title">
                  <TextField source="abbreviated_title" />
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.fieldMargin}>
              <Labeled label="Publication Authors">
                <TextField source="author_name" />
              </Labeled>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Day">
                  <TextField source="publication_day" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Month">
                  <TextField source="publication_month" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Year">
                  <TextField source="publication_month" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Published?">
                  <TextField source="published" />
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Labeled label="DOI">
                <TextField source="doi" />
              </Labeled>
            </Box>
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication metadata
              </Typography>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Authors">
                  <ReferenceArrayField
                    label="User Roles"
                    reference="authors"
                    source="author_ids"
                  >
                    <SingleFieldList>
                      <ChipField source="abbreviation" />
                    </SingleFieldList>
                  </ReferenceArrayField>
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Labeled label="Publisher">
                <TextField source="publisher" />
              </Labeled>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Parent Publication">
                  <ReferenceField
                    label="Parent"
                    source="parent_id"
                    reference="publications"
                  >
                    <TextField source="abbreviated_title" />
                  </ReferenceField>
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Published Location">
                  <TextField source="published_location" />
                </Labeled>
              </Box>
            </Box>
          </Tab>
          <Tab label="Details" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Details
              </Typography>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Legacy ID">
                  <TextField source="legacy_id" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="ISBN">
                  <TextField source="isbn" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="ISSN">
                  <TextField source="issn" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="TL-2">
                  <TextField source="tl2" />
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Labeled label="BHL URL">
                <TextField source="bhl_url" />
              </Labeled>
            </Box>
            <Box className={globalClasses.formRow}>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Reference type">
                  <TextField source="reference_type" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Reference author role">
                  <TextField source="reference_author_role" />
                </Labeled>
              </Box>
              <Box className={globalClasses.fieldMargin}>
                <Labeled label="Duplication of">
                  <ReferenceField
                    label="Duplicate Of"
                    source="duplicate_of_id"
                    reference="publications"
                  >
                    <TextField source="abbreviated_title" />
                  </ReferenceField>
                </Labeled>
              </Box>
            </Box>
            <Box className={globalClasses.formRow}>
              <Labeled label="Language">
                <TextField source="language" />
              </Labeled>
            </Box>
          </Tab>
          <Tab label="Notes" className={globalClasses.bold}>
            <Box className={globalClasses.sectionMargin}>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Notes
              </Typography>
            </Box>
            <TextField source="notes" />
          </Tab>
        </TabbedShowLayout>
      </>
    </Show>
  );
};

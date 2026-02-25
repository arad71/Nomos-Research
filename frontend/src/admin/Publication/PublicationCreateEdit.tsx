import {
  TabbedForm,
  FormTab,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  required,
  TextField,
  TextInput,
  ReferenceArrayInput,
  AutocompleteInput,
  Labeled,
  AutocompleteArrayInput,
  minValue,
  maxValue,
} from 'react-admin';
import React, { FC } from 'react';
import makeStyles from 'lib/makeStyles';
import { Box, Typography } from '@mui/material';
import { GlobalTheme, GlobalGridTheme } from '../../GlobalTheme';
import EditToolbar from '../shared/EditToolbar';

const useStyles = makeStyles({
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '90%',
    gridColumnGap: '1.5em',
  },
});

export const PublicationCreateEdit: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const gridClasses = GlobalGridTheme();
  // eslint-disable-next-line max-len
  const titleClasses = `${globalClasses.title} ${globalClasses.titleTruncation}`;
  return (
    <>
      <Box className={globalClasses.titlePos}>
        <Box>
          <TextField className={titleClasses} source="display_title" />
        </Box>
        <TextField
          source="verbatim_author"
          className={globalClasses.subtitle}
        />
      </Box>
      <TabbedForm
        {...props}
        toolbar={<EditToolbar resource="publications" />}
      >
        <FormTab label="Publication" className={globalClasses.bold}>
          <Box className={`${classes.mainGrid} ${globalClasses.sectionMargin}`}>
            <Box>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication
              </Typography>
            </Box>
            <TextInput
              source="title"
              className={gridClasses.EightCol1to5span}
            />
            <TextInput
              source="abbreviated_title"
              validate={required()}
              className={gridClasses.EightCol5to9span}
            />
            <Labeled
              label="Publication Authors"
              className={gridClasses.EightCol1to5span}
            >
              <Box className={gridClasses.EightCol1to5span}>
                <TextField source="author_name" />
              </Box>
            </Labeled>
            <NumberInput
              source="publication_day"
              label="Day"
              className={gridClasses.EightCol1to2span}
              validate={[minValue(1), maxValue(31)]}
              min={1}
              max={31}
            />
            <NumberInput
              source="publication_month"
              label="Month"
              className={gridClasses.EightCol2to3span}
              validate={[minValue(1), maxValue(12)]}
              min={1}
              max={12}
            />
            <NumberInput
              source="publication_year"
              label="Year"
              className={gridClasses.EightCol3to4span}
              validate={minValue(1735)}
              min={1735}
            />
            <BooleanInput
              label="Published"
              source="published"
              className={gridClasses.EightCol4to5span}
              defaultValue={false}
            />
            <TextInput source="doi" className={gridClasses.EightCol1to5span} />
            <Box
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.sectionMargin}`}
            >
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication metadata
              </Typography>
            </Box>
            <ReferenceArrayInput
              source="author_ids"
              reference="authors"
              sort={{ field: 'abbreviation', order: 'ASC' }}
              perPage={100}
            >
              <AutocompleteArrayInput optionText="abbreviation" resettable />
            </ReferenceArrayInput>
            <TextInput
              source="publisher"
              className={gridClasses.EightCol1to5span}
            />
            <Box className={gridClasses.EightCol1to5span}>
              <ReferenceInput
                label="Parent"
                source="parent_id"
                reference="publications"
                sort={{ field: 'abbreviated_title', order: 'ASC' }}
                fullWidth
                perPage={100}
              >
                <AutocompleteInput optionText="abbreviated_title" resettable />
              </ReferenceInput>
            </Box>
            <TextInput
              source="published_location"
              className={gridClasses.EightCol5to7span}
            />
            <TextInput
              source="volume"
              className={gridClasses.EightCol1to3span}
            />
            <TextInput
              source="edition"
              className={gridClasses.EightCol3to5span}
            />
            <TextInput
              source="pages"
              className={gridClasses.EightCol5to7span}
            />
          </Box>
        </FormTab>
        <FormTab label="Details" className={globalClasses.bold}>
          <Box className={`${classes.mainGrid} ${globalClasses.sectionMargin}`}>
            <Box>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Details
              </Typography>
            </Box>
            <NumberInput
              source="legacy_id"
              label="Legacy ID"
              className={gridClasses.EightCol1to3span}
              validate={minValue(0)}
              min={0}
            />
            <TextInput
              source="isbn"
              label="ISBN"
              className={gridClasses.EightCol3to5span}
            />
            <TextInput
              source="issn"
              label="ISSN"
              className={gridClasses.EightCol5to7span}
            />
            <TextInput
              source="tl2"
              label="TL2"
              className={gridClasses.EightCol7to9span}
            />
            <TextInput
              source="bhl_url"
              label="BHL URL"
              className={gridClasses.EightCol1to5span}
            />
            <TextInput
              source="reference_type"
              className={gridClasses.EightCol1to3span}
            />
            <TextInput
              source="reference_author_role"
              className={gridClasses.EightCol3to5span}
            />
            <ReferenceInput
              label="Duplicate Of"
              source="duplicate_of_id"
              reference="publications"
              className={gridClasses.EightCol5to9span}
              sort={{ field: 'abbreviated_title', order: 'ASC' }}
            >
              <AutocompleteInput optionText="abbreviated_title" />
            </ReferenceInput>
            <TextInput
              source="language"
              className={gridClasses.EightCol1to3span}
            />
          </Box>
        </FormTab>
        <FormTab label="Notes" className={globalClasses.bold}>
          <Box className={`${classes.mainGrid} ${globalClasses.sectionMargin}`}>
            <Box>
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Notes
              </Typography>
            </Box>
            <TextInput
              source="notes"
              className={gridClasses.EightCol1to9span}
              multiline
              fullWdith
            />
          </Box>
        </FormTab>
      </TabbedForm>
    </>
  );
};

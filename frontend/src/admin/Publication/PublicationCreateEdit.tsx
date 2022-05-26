import {
  TabbedForm,
  FormTab,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  NullableBooleanInput,
  RichTextField,
  ReferenceField,
  PasswordInput,
} from 'react-admin';
import React, { FC } from 'react';
import RichTextInput from 'ra-input-rich-text';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme } from '../../GlobalTheme';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1.5em',
    marginRight: '0.2em',
  },
  tablabel: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1em',
  },
  titlePos: {
    position: 'absolute',
    top: '65px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    width: '90%',
    gridColumnGap: '1.5em',
  },
  twoColSpan: {
    gridColumn: '1 / 5',
  },
  twoBColSpan: {
    gridColumn: '5 / 9',
  },
  testSpan: {
    gridColumn: '1 / 2',
  },
  testSpan2: {
    gridColumn: '2 / 3',
  },
  testSpan3: {
    gridColumn: '3 / 4',
  },
  testSpan4: {
    gridColumn: '4 / 5',
  },
  anotherSpan: {
    gridColumn: '1 / 3',
  },
  anotherSpan2: {
    gridColumn: '3 / 5',
  },
  anotherSpan3: {
    gridColumn: '5 / 7',
  },
});

export const PublicationCreateEdit: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  return (
    <>
      <Box className={classes.titlePos}>
        <Box>
          <RichTextField className={classes.title} source="title" />
        </Box>
        <TextField source="verbatim_author" className={classes.subtitle} />
      </Box>
      <TabbedForm {...props}>
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
              className={classes.twoColSpan}
              fullWidth
            />
            <TextInput
              source="abbreviated_title"
              validate={required()}
              className={classes.twoBColSpan}
              fullWidth
            />
            <TextInput
              source="verbatim_author"
              className={classes.twoColSpan}
            />
            <NumberInput
              source="publication_day"
              label="Day"
              className={classes.testSpan}
            />
            <NumberInput
              source="publication_month"
              label="Month"
              className={classes.testSpan2}
            />
            <NumberInput
              source="publication_year"
              label="Year"
              className={classes.testSpan3}
            />
            <BooleanInput
              label="Published"
              source="published"
              defaultValue={false}
            />
            <TextInput source="doi" className={classes.twoColSpan} />
            <Box
              className={`${classes.twoColSpan} ${globalClasses.sectionMargin}`}
            >
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication metadata
              </Typography>
            </Box>
            <TextInput
              source="verbatim_author"
              className={classes.twoColSpan}
            />
            <TextInput source="publisher" className={classes.twoColSpan} />
            <ReferenceInput
              label="Parent"
              source="parent_id"
              reference="publications"
              className={classes.twoColSpan}
            >
              <SelectInput optionText="title" />
            </ReferenceInput>
            <TextInput
              source="published_location"
              className={classes.anotherSpan3}
            />
            <TextInput source="volume" className={classes.anotherSpan} />
            <TextInput source="edition" className={classes.anotherSpan2} />
            <TextInput source="pages" className={classes.anotherSpan3} />
          </Box>
        </FormTab>
        <FormTab label="Details" className={globalClasses.bold}>
          <TextInput source="abbreviated_title" validate={[required()]} />
          <NullableBooleanInput
            label="Bad Publication"
            source="bad_publication"
          />
          <TextInput source="doi" />
          <TextInput source="title" />
          <TextInput source="display_title" />
          <NumberInput source="publication_year" />
          <NumberInput source="publication_month" />
          <NumberInput source="publication_day" />
          <TextInput source="volume" />
          <TextInput source="edition" />
          <TextInput source="pages" />
          <TextInput source="verbatim_reference" />
          <TextInput source="verbatim_citation" />
          <TextInput source="verbatim_author" />
          <TextInput source="citation" />
          <RichTextInput source="citation_html" />
          <TextInput source="citation_author_year" />
          <TextInput source="notes" />
          <BooleanInput
            label="Published"
            source="published"
            defaultValue={false}
          />
          <TextInput source="publisher" />
          <TextInput source="published_location" />
          <TextField source="publication_date" />
          <TextInput source="isbn" />
          <TextInput source="issn" />
          <TextInput source="bhl_url" />
          <TextInput source="tl2" />
          <TextInput source="reference_type" />
          <ReferenceInput
            label="Parent"
            source="parent_id"
            reference="publications"
          >
            <SelectInput optionText="abbreviated_title" />
          </ReferenceInput>
          <TextInput source="reference_author_role" />
          <TextInput source="language" />
          <ReferenceInput
            label="Duplicate Of"
            source="duplicate_of_id"
            reference="publications"
          >
            <SelectInput optionText="abbreviated_title" />
          </ReferenceInput>
        </FormTab>
        <FormTab label="References" className={globalClasses.bold}></FormTab>
        <FormTab label="Notes" className={globalClasses.bold}></FormTab>
      </TabbedForm>
    </>
  );
};

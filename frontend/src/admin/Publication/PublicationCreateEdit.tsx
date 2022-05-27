import {
  TabbedForm,
  FormTab,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  TextField,
  TextInput,
  RichTextField,
} from 'react-admin';
import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { GlobalTheme, GlobalGridTheme } from '../../GlobalTheme';

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
});

export const PublicationCreateEdit: FC = (props) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const gridClasses = GlobalGridTheme();
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
              className={gridClasses.EightCol1to5span}
              fullWidth
            />
            <TextInput
              source="abbreviated_title"
              validate={required()}
              className={gridClasses.EightCol5to9span}
              fullWidth
            />
            <TextInput
              source="verbatim_author"
              className={gridClasses.EightCol1to5span}
            />
            <NumberInput
              source="publication_day"
              label="Day"
              className={gridClasses.EightCol1to2span}
            />
            <NumberInput
              source="publication_month"
              label="Month"
              className={gridClasses.EightCol2to3span}
            />
            <NumberInput
              source="publication_year"
              label="Year"
              className={gridClasses.EightCol3to4span}
            />
            <BooleanInput
              label="Published"
              source="published"
              className={gridClasses.EightCol4to5span}
              defaultValue={false}
            />
            <TextInput source="doi" className={gridClasses.EightCol1to5span} />
            <Box
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
            <TextInput
              source="verbatim_author"
              className={gridClasses.EightCol1to5span}
            />
            <TextInput
              source="publisher"
              className={gridClasses.EightCol1to5span}
            />
            <ReferenceInput
              label="Parent"
              source="parent_id"
              reference="publications"
              className={gridClasses.EightCol1to5span}
            >
              <SelectInput optionText="title" />
            </ReferenceInput>
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
              className={gridClasses.EightCol1to3span}
            />
            <TextInput source="isbn" className={gridClasses.EightCol3to5span} />
            <TextInput source="issn" className={gridClasses.EightCol5to7span} />
            <TextInput source="tl2" className={gridClasses.EightCol7to9span} />
            <TextInput
              source="bhl_url"
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
            >
              <SelectInput optionText="abbreviated_title" />
            </ReferenceInput>
            <TextInput
              source="language"
              className={gridClasses.EightCol1to3span}
            />
          </Box>
        </FormTab>
        <FormTab label="References" className={globalClasses.bold}></FormTab>
        <FormTab label="Notes" className={globalClasses.bold}></FormTab>
      </TabbedForm>
    </>
  );
};

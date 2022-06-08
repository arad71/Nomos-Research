import {
  BooleanInput,
  FormTab,
  Labeled,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  required,
  SelectField,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
  number,
  minValue,
} from 'react-admin';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';
import React, { FC, PropsWithChildren } from 'react';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import AuthorType from '../Citations/AuthorType';
import { Box, Typography } from '@material-ui/core';
import { CitationRowForm } from '../Citations';
import { EditableCrossReferenceManyGrid } from '../Cross_references';
import { GlobalGridTheme, GlobalTheme } from '../../GlobalTheme';
import { NamePageSummary } from './NamePageSummary';

const validateNumber = [number(), minValue(0)];

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
});

export const TaxonNameCreateEdit: FC = ({
  ...props
}: PropsWithChildren<any>) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const gridClasses = GlobalGridTheme();
  const citationInitialValues = { taxon_name_id: props.record?.id };
  const oldNameInitialValues = { new_name_id: props.record?.id, active: true };
  const newNameInitialValues = { old_name_id: props.record?.id, active: true };
  return (
    <>
      <NamePageSummary />
      <TabbedForm {...props} warnWhenUnsavedChanges>
        <FormTab label="Name" className={globalClasses.bold}>
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <ReferenceInput
              source="rank_id"
              reference="taxon_ranks"
              validate={[required()]}
              className={gridClasses.EightCol1to3span}
            >
              <SelectInput optionText="rank_name" fullWidth />
            </ReferenceInput>
            <TextInput
              source="uninomial"
              className={gridClasses.EightCol1to3span}
            />
            <TextInput
              source="specific_epithet"
              className={gridClasses.EightCol3to5span}
            />
            <TextInput
              source="infraspecific_epithet"
              className={gridClasses.EightCol5to7span}
            />
            <NumberInput
              source="form_desc_dy"
              label="Day"
              className={gridClasses.EightCol1to2span}
              min={0}
              validate={validateNumber}
            />
            <NumberInput
              source="form_desc_mn"
              label="Month"
              className={gridClasses.EightCol2to3span}
              min={0}
              validate={validateNumber}
            />
            <NumberInput
              source="form_desc_yr"
              label="Year"
              className={gridClasses.EightCol3to4span}
              min={0}
              validate={validateNumber}
            />
            <SelectInput
              source="publication_status"
              choices={PublicationStatus}
              className={gridClasses.EightCol1to3span}
            />
            <BooleanInput
              label="Current"
              source="is_current"
              validate={required()}
              defaultValue={false}
              className={gridClasses.EightCol3to5span}
            />
            <BooleanInput
              label="Validated"
              source="validated"
              validate={required()}
              defaultValue={false}
              className={gridClasses.EightCol5to7span}
            />
            <Box
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.sectionMargin}`}
            >
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Authors
              </Typography>
            </Box>
            <Box className={gridClasses.EightCol1to9span}>
              {(props.record?.id && (
                <ReferenceManyField
                  fullWidth
                  label="Authors"
                  reference="citations"
                  target="taxon_name_id"
                  sort={{
                    field: 'author_type,author_order',
                    order: 'ASC,ASC',
                  }}
                  {...props}
                >
                  <EditableDatagrid
                    undoable
                    createForm={
                      <CitationRowForm
                        initialValues={citationInitialValues}
                        {...props}
                      />
                    }
                    editForm={<CitationRowForm {...props} />}
                    hasCreate
                  >
                    <ReferenceField source="author_id" reference="authors">
                      <TextField source="abbreviation" />
                    </ReferenceField>
                    <SelectField source="author_type" choices={AuthorType} />
                    <NumberField source="author_order" />
                  </EditableDatagrid>
                </ReferenceManyField>
              )) || (
                <Typography>
                  You need to save the record before you can add any authors /
                  citations.
                </Typography>
              )}
            </Box>
            <Box
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.sectionMargin}`}
            >
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Publication
              </Typography>
            </Box>
            <ReferenceInput
              source="publication_id"
              reference="publications"
              className={gridClasses.EightCol1to5span}
            >
              <SelectInput optionText="title" />
            </ReferenceInput>
            <Box
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.sectionMargin}`}
            >
              <Typography
                variant="h5"
                className={globalClasses.bold}
                gutterBottom
              >
                Vernacular names (placeholder)
              </Typography>
            </Box>
            <TextInput
              source="vernacular"
              className={gridClasses.EightCol1to5span}
            />
          </Box>
        </FormTab>
        <FormTab label="Details" className={globalClasses.bold}>
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <TextInput
              source="family_code"
              className={gridClasses.EightCol1to3span}
            />
            <TextInput
              source="origin"
              className={gridClasses.EightCol3to5span}
            />
            <SelectInput
              source="naturalised_status"
              choices={NaturalisedStatus}
              className={gridClasses.EightCol1to3span}
            />
            <Box className={gridClasses.EightCol3to5span}>
              <NullableBooleanInput
                source="naturalised_certainty"
                className={classes.fullWidth}
              />
            </Box>
            <TextInput
              multiline
              source="naturalised_comments"
              className={gridClasses.EightCol1to5span}
            />
          </Box>
        </FormTab>
        <FormTab label="Hierarchy" className={globalClasses.bold}></FormTab>
        <FormTab label="Related Names" className={globalClasses.bold}>
          <Box
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Box className={gridClasses.EightCol1to9span}>
              <Labeled label="Previous names">
                <EditableCrossReferenceManyGrid
                  props={props}
                  source="old_name_id"
                  target="new_name_id"
                  label="Previous names"
                  createInitialValues={oldNameInitialValues}
                />
              </Labeled>
            </Box>
            <Box className={gridClasses.EightCol1to9span}>
              <Labeled label="Subsequent names">
                <EditableCrossReferenceManyGrid
                  props={props}
                  source="new_name_id"
                  target="old_name_id"
                  label="Subsequent names"
                  createInitialValues={newNameInitialValues}
                />
              </Labeled>
            </Box>
          </Box>
        </FormTab>
        <FormTab label="Notes" className={globalClasses.bold}>
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
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

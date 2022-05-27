import {
  BooleanInput,
  DateTimeInput,
  FormTab,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  required,
  RichTextField,
  SelectField,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
} from 'react-admin';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';
import React, { FC, PropsWithChildren } from 'react';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import AuthorType from '../Citations/AuthorType';
import { Typography } from '@material-ui/core';
import { CitationRowForm } from '../Citations';

const useStyles = makeStyles({
  tablabel: {
    fontWeight: 'bold',
  },
});

export const TaxonNameCreateEdit: FC = ({
  ...props
}: PropsWithChildren<any>) => {
  const classes = useStyles();
  const initialValues = { taxon_name_id: props.record?.id };
  return (
    <TabbedForm {...props}>
      <FormTab label="Name" className={classes.tablabel}>
        <ReferenceInput
          source="kingdom_id"
          reference="kingdoms"
          validate={[required()]}
        >
          <SelectInput optionText="kingdom_name" />
        </ReferenceInput>
        <ReferenceInput
          source="rank_id"
          reference="taxon_ranks"
          validate={[required()]}
        >
          <SelectInput optionText="rank_name" />
        </ReferenceInput>
        <TextField source="canonical_name" />
        <TextField source="scientific_name" />
        <RichTextField source="formatted_scientific_name" />
        <TextInput source="phylum" />
        <TextInput source="taxon_class" label="Class" />
        <TextInput source="order" />
        <TextInput source="family" />
        <TextInput source="genus" />
        <TextInput source="subgenus" />
        <TextInput source="species" />
        <TextInput source="subspecies" />
        <TextInput source="uninomial" />
        <TextInput source="specific_epithet" />
        <TextInput source="infraspecific_epithet" />
        <ReferenceInput source="publication_id" reference="publications">
          <SelectInput optionText="title" />
        </ReferenceInput>
        <TextInput source="volume_information" />
        <BooleanInput
          label="Current"
          source="is_current"
          validate={required()}
          defaultValue={false}
        />
        <TextInput source="origin" />
        <SelectInput source="publication_status" choices={PublicationStatus} />
        <NumberInput source="form_desc_yr" />
        <NumberInput source="form_desc_mn" />
        <NumberInput source="form_desc_dy" />
        <TextInput multiline source="comments" />
        <TextInput source="contributed_by" />
        <DateTimeInput source="contributed_on" />
        <BooleanInput
          label="Validated"
          source="validated"
          validate={required()}
          defaultValue={false}
        />
        <TextInput source="source" />
        <TextInput source="external_id" />
        <TextInput source="family_code" />
        <TextField source="author" />
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
                <CitationRowForm initialValues={initialValues} {...props} />
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

        <TextInput source="vernacular" />
        <TextField source="editor" />
        <SelectInput source="naturalised_status" choices={NaturalisedStatus} />
        <NullableBooleanInput
          label="Naturalised Certainty"
          source="naturalised_certainty"
        />
        <TextInput source="is_eradicated" />
        <TextInput multiline source="naturalised_comments" />
        <NumberInput source="linear_sequence" />
        <ReferenceInput
          label="Family NID"
          source="family_nid"
          reference="taxon_names"
        >
          <SelectInput optionText="scientific_name" />
        </ReferenceInput>
        <TextInput multiline source="all_vernaculars" />
        <TextInput multiline source="notes" />
        <DateTimeInput source="authorised_on" />
      </FormTab>
      <FormTab label="Details" className={classes.tablabel}></FormTab>
      <FormTab label="Heirarchy" className={classes.tablabel}></FormTab>
      <FormTab label="Cross References" className={classes.tablabel}></FormTab>
      <FormTab label="Notes" className={classes.tablabel}></FormTab>
    </TabbedForm>
  );
};

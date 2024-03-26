import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  FormDataConsumer,
  FormTab,
  Labeled,
  maxValue,
  minValue,
  NullableBooleanInput,
  number,
  NumberField,
  NumberInput,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  required,
  RichTextField,
  SelectArrayInput,
  SelectField,
  SelectInput,
  DateField,
  TabbedForm,
  SimpleForm,
  TextField,
  TextInput,
} from 'react-admin';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';
import React, { FC, PropsWithChildren } from 'react';
import NaturalisedStatus from '../Taxon_names/NaturalisedStatus';
import PublicationStatus from '../Taxon_names/PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import AuthorType from '../Citations/AuthorType';
import LanguageType from '../Vernaculars/LanguageType';
import { Box, Typography } from '@material-ui/core';
import { CitationRowForm } from '../Citations';
import { ConscodesTaxonRowForm } from '../Conscode_taxons';
import { ConservationShort } from '../Conservation_codes/ConservationShort';
import { EmbeddedVernacularShow, VernacularRowForm } from '../Vernaculars';
import { GlobalGridTheme, GlobalTheme } from '../../GlobalTheme';
import { NamePageSummary } from '../Taxon_names/NamePageSummary';
// eslint-disable-next-line max-len
import { EmbeddedCrossReferenceShow } from '../Cross_references/EmbeddedCrossReferenceShow';
import CrossRefType from '../Cross_references/CrossRefType';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
// eslint-disable-next-line max-len
import { CrossReferenceRowForm } from '../Cross_references/CrossReferenceRowForm';
import { EmbeddedHierarchyShow, HierarchyRowForm } from '../Hierarchies';
import EditToolbar from '../shared/EditToolbar';
import { canAccess, usePermissions } from '@react-admin/ra-rbac';
import { Label } from '@material-ui/icons';
import NestedLinkField from '../shared/NestedLinkField';

const validateNumber = [number(), minValue(0)];

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
  bottomMargin: {
    marginBottom: '2em',
  },
  redTypography: {
    color: '#ff0000',
  },
  columnStart: {
    gridColumnStart: 1,
  },

  showPad: {
    padding: '0',
  },
});
export interface FormData {
  kingdom_id: number;
}
export interface FormDataProps {
  formData: FormData;
  rest: PropsWithChildren<any>;
}
export const TaxonNameCodeCreateEdit: FC = ({
  ...props
}: PropsWithChildren<any>) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const gridClasses = GlobalGridTheme();
  const citationInitialValues = {
    taxon_name_id: props.record?.id,
  };
  const conscodesTaxonsInitialValues = {
    taxon_name_id: props.record?.id,
  };
  const hierarchyInitialValues = { taxon_name_id: props.record?.id };
  const vernacularInitialValues = {
    taxon_name_id: props.record?.id,
  };
  const oldNameInitialValues = {
    new_name_id: props.record?.id,
  };
  const newNameInitialValues = {
    old_name_id: props.record?.id,
  };
  const { loading, permissions } = usePermissions();
  if (loading) return null;

  return (
    <>
      <NamePageSummary />
      <SimpleForm
        {...props}
        toolbar={<EditToolbar resource="taxon_names" />}
        warnWhenUnsavedChanges
      >
        <Box className={classes.fullWidth}>
          <Box className={classes.showPad}>
            <Labeled label="Taxon name">
              <FormattedScientificNameWithStatus />
            </Labeled>
            <br />
            <br />

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
          </Box>

          {/* Start here */}
          <Box
            /* eslint-disable-next-line max-len */
            className={`${gridClasses.EightCol1to9span} ${globalClasses.sectionMargin}`}
          >
            <Typography variant="h5" className={globalClasses.bold}>
              Conservation codes
            </Typography>
            <Typography
              variant="subtitle2"
              className={classes.redTypography}
              gutterBottom
            >
              {/* eslint-disable-next-line max-len */}
              Save records in this grid before exiting and/or saving Taxon Name.
              Saved changes will display when page is refreshed
            </Typography>
          </Box>
          <Box className={gridClasses.EightCol1to9span}>
            {(props.record?.id && (
              <ReferenceManyField
                fullWidth
                label="Conservation codes"
                reference="conscode_taxons"
                target="taxon_name_id"
                sort={{
                  field: 'conservation_code___code_priority',
                  order: 'ASC',
                }}
                {...props}
              >
                <EditableDatagrid
                  /* eslint-disable-next-line max-len */
                  className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                  createForm={
                    <ConscodesTaxonRowForm
                      initialValues={conscodesTaxonsInitialValues}
                      {...props}
                    />
                  }
                  editForm={<ConscodesTaxonRowForm {...props} />}
                  hasCreate
                  noDelete={
                    !canAccess({
                      permissions,
                      action: 'delete',
                      resource: 'conscode_taxon',
                    })
                  }
                >
                  <ReferenceField
                    source="conservation_code_id"
                    reference="conservation_codes"
                    link="show"
                  >
                    <ConservationShort source="conservation_code_id" />
                  </ReferenceField>
                  <DateField source="effective_from" />
                  <DateField source="effective_to" />
                  <TextField source="notes" />
                </EditableDatagrid>
              </ReferenceManyField>
            )) || (
              <Typography>
                You need to save the record before you can add any conservation
                code .
              </Typography>
            )}
          </Box>

          {/* End here */}
        </Box>
      </SimpleForm>
    </>
  );
};

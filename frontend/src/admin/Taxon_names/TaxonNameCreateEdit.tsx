import {
  BooleanInput,
  FormTab,
  Labeled,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceField,
  BooleanField,
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
  SelectArrayInput,
  ReferenceArrayInput,
  AutocompleteInput,
  RichTextField,
  FormDataConsumer,
} from 'react-admin';
import { EditableDatagrid } from '@react-admin/ra-editable-datagrid';
import React, { FC, PropsWithChildren } from 'react';
import NaturalisedStatus from './NaturalisedStatus';
import PublicationStatus from './PublicationStatus';
import { makeStyles } from '@material-ui/core/styles';
import AuthorType from '../Citations/AuthorType';
import LanguageType from '../Vernaculars/LanguageType';
import { Box, Typography } from '@material-ui/core';
import { CitationRowForm } from '../Citations';
import { VernacularRowForm, EmbeddedVernacularShow } from '../Vernaculars';
import { GlobalGridTheme, GlobalTheme } from '../../GlobalTheme';
import { NamePageSummary } from './NamePageSummary';
// eslint-disable-next-line max-len
import { EmbeddedCrossReferenceShow } from '../Cross_references/EmbeddedCrossReferenceShow';
import CrossRefType from '../Cross_references/CrossRefType';
import { FormattedScientificNameWithStatus } from '../Taxon_names';
// eslint-disable-next-line max-len
import { CrossReferenceRowForm } from '../Cross_references/CrossReferenceRowForm';
import { EmbeddedHierarchyShow, HierarchyRowForm } from '../Hierarchies';
import ScientificNameReference from './ScientificNameReference';
import EditToolbar from '../shared/EditToolbar';
import { canAccess, usePermissions } from '@react-admin/ra-rbac';

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
});
export interface FormData {
  kingdom_id: number;
}
export interface FormDataProps {
  formData: FormData;
  rest: PropsWithChildren<any>;
}
export const TaxonNameCreateEdit: FC = ({
  ...props
}: PropsWithChildren<any>) => {
  const classes = useStyles();
  const globalClasses = GlobalTheme();
  const gridClasses = GlobalGridTheme();
  const citationInitialValues = {
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
  const role: any = localStorage.getItem('scopes');
  let deleted_column = null;
  if (role == 'SUPER_ADMIN') {
    deleted_column = <BooleanField source="deleted" />;
  }
  const { loading, permissions } = usePermissions();
  if (loading) return null;

  return (
    <>
      <NamePageSummary />
      <TabbedForm
        {...props}
        toolbar={<EditToolbar resource="taxon_names" />}
        warnWhenUnsavedChanges
      >
        <FormTab label="Name" className={globalClasses.bold}>
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to3span} ${globalClasses.bold}`}
              gutterBottom
            >
              Taxon Name
            </Typography>
            <ReferenceInput
              source="kingdom_id"
              reference="kingdoms"
              validate={[required()]}
              className={gridClasses.EightCol1to3span}
            >
              <SelectInput optionText="kingdom_name" fullWidth />
            </ReferenceInput>
            <FormDataConsumer>
              {({ formData, ...rest }: FormDataProps) => (
                <ReferenceInput
                  source="rank_id"
                  reference="taxon_ranks"
                  validate={[required()]}
                  className={gridClasses.EightCol3to5span}
                  filter={{ kingdom_id: formData.kingdom_id }}
                  {...rest}
                  sort={{ field: 'rank_name', order: 'ASC' }}
                  perPage={100}
                >
                  <AutocompleteInput
                    optionText="rank_name"
                    fullWidth
                    resettable
                  />
                </ReferenceInput>
              )}
            </FormDataConsumer>
            <TextInput
              source="uninomial"
              className={gridClasses.EightCol1to3span}
              validate={required()}
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
              className={`${gridClasses.EightCol1to9span} ${globalClasses.sectionMargin}`}
            >
              <Typography variant="h5" className={globalClasses.bold}>
                Authors
              </Typography>
              <Typography
                variant="subtitle2"
                className={classes.redTypography}
                gutterBottom
              >
                {/* eslint-disable-next-line max-len */}
                Ensure to save within datagrid on create/edit or data could be
                lost. Taxon name header will not reflect updated author details
                until page is refreshed
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
                    /* eslint-disable-next-line max-len */
                    className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                    createForm={
                      <CitationRowForm
                        initialValues={citationInitialValues}
                        {...props}
                      />
                    }
                    editForm={<CitationRowForm {...props} />}
                    hasCreate
                    noDelete={
                      !canAccess({
                        permissions,
                        action: 'delete',
                        resource: 'citations',
                      })
                    }
                  >
                    <ReferenceField source="author_id" reference="authors">
                      <TextField source="abbreviation" />
                    </ReferenceField>
                    <SelectField source="author_type" choices={AuthorType} />
                    <NumberField source="author_order" />
                    {deleted_column}
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
              sort={{ field: 'abbreviated_title', order: 'ASC' }}
              perPage={100}
              className={gridClasses.EightCol1to5span}
            >
              <AutocompleteInput optionText="title" fullWidth resettable />
            </ReferenceInput>
            <Box
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.sectionMargin}`}
            >
              <Typography variant="h5" className={globalClasses.bold}>
                Vernacular names
              </Typography>
              <Typography
                variant="subtitle2"
                className={classes.redTypography}
                gutterBottom
              >
                {/* eslint-disable-next-line max-len */}
                Ensure to save within datagrid on create/edit or data could be
                lost
              </Typography>
            </Box>
            <Box className={gridClasses.EightCol1to9span}>
              {(props.record?.id && (
                <ReferenceManyField
                  fullWidth
                  label="Vernaculars"
                  reference="vernaculars"
                  target="taxon_name_id"
                  sort={{
                    field: 'vernacular_name,sort_order',
                    order: 'ASC,ASC',
                  }}
                  {...props}
                >
                  <EditableDatagrid
                    /* eslint-disable-next-line max-len */
                    className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                    createForm={
                      <VernacularRowForm
                        initialValues={vernacularInitialValues}
                        {...props}
                      />
                    }
                    editForm={<VernacularRowForm {...props} />}
                    hasCreate
                    expand={<EmbeddedVernacularShow />}
                    noDelete={
                      !canAccess({
                        permissions,
                        action: 'delete',
                        resource: 'vernaculars',
                      })
                    }
                  >
                    <TextField source="vernacular_name" />
                    <SelectField source="language" choices={LanguageType} />
                    <BooleanField
                      source="lang_pref"
                      label="Preferred language"
                    />
                    <BooleanField source="preferred" />
                    <NumberField source="sort_order" />
                  </EditableDatagrid>
                </ReferenceManyField>
              )) || (
                <Typography>
                  You need to save the record before you can add any
                  vernaculars.
                </Typography>
              )}
            </Box>
          </Box>
        </FormTab>
        <FormTab label="Details" path="details" className={globalClasses.bold}>
          <Typography
            variant="h5"
            className={`${globalClasses.bold} ${globalClasses.sectionMargin}`}
            gutterBottom
          >
            Taxon name - Details
          </Typography>
          <Box
            /* eslint-disable-next-line max-len */
            className={globalClasses.mainGrid}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to3span} ${globalClasses.bold}`}
              gutterBottom
            >
              Naturalised Status
            </Typography>
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
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to3span} ${globalClasses.bold}`}
              gutterBottom
            >
              Informal Groups
            </Typography>
            <ReferenceArrayInput
              source="classification_system_ids"
              reference="classification_systems"
              fullWidth
              filter={{ class_type: ['informal'] }}
            >
              <SelectArrayInput
                optionText="class_desc"
                fullWidth
                className={gridClasses.EightCol1to3span}
              />
            </ReferenceArrayInput>
          </Box>
        </FormTab>
        <FormTab
          label="Hierarchy"
          path="hierarchy"
          className={globalClasses.bold}
        >
          <Box /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.bold} ${classes.columnStart}`}
              gutterBottom
            >
              Taxon Name - Hierarchy
            </Typography>
            <Typography
              variant="subtitle2"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to9span} ${classes.redTypography}`}
              gutterBottom
            >
              {/* eslint-disable-next-line max-len */}
              Ensure to save within datagrid on create/edit or data could be
              lost. Taxon name header will not reflect updated author details
              until page is refreshed
            </Typography>
            <Box className={gridClasses.EightCol1to9span}>
              {(props.record?.id && (
                <ReferenceManyField
                  fullWidth
                  label="Hierarchical classification"
                  reference="hierarchies"
                  target="taxon_name_id"
                  sort={{
                    field: 'path',
                    order: 'ASC',
                  }}
                  {...props}
                >
                  <EditableDatagrid
                    hasCreate
                    // eslint-disable-next-line max-len
                    className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                    createForm={
                      <HierarchyRowForm
                        initialValues={hierarchyInitialValues}
                        {...props}
                      />
                    }
                    editForm={<HierarchyRowForm {...props} />}
                    expand={<EmbeddedHierarchyShow />}
                    noDelete={
                      !canAccess({
                        permissions,
                        action: 'delete',
                        resource: 'hierarchies',
                      })
                    }
                  >
                    <ReferenceField
                      source="classification_system_id"
                      reference="classification_systems"
                      filter={{ class_type: 'hierarchical' }}
                    >
                      <TextField source="class_desc" />
                    </ReferenceField>
                    <ReferenceField
                      source="parent_nid"
                      reference="taxon_names"
                      label="Parent name"
                      link="show"
                      sortBy="taxon_name___scientific_name"
                    >
                      <RichTextField source="formatted_scientific_name" />
                    </ReferenceField>
                  </EditableDatagrid>
                </ReferenceManyField>
              )) || (
                <Typography>
                  You need to save the record before you can add any authors /
                  citations.
                </Typography>
              )}
            </Box>
          </Box>
        </FormTab>
        <FormTab
          label="Related Names"
          path="related_names"
          className={globalClasses.bold}
        >
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.bold}`}
            >
              Taxon Name - Related Names
            </Typography>
            <Typography
              variant="subtitle2"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${classes.redTypography}`}
              gutterBottom
            >
              {/* eslint-disable-next-line max-len */}
              Ensure to save within datagrid on create/edit or data could be
              lost
            </Typography>
            <Box className={gridClasses.EightCol1to9span}>
              <Labeled label="Previous names">
                {(props.record?.id && (
                  <ReferenceManyField
                    fullWidth
                    reference="cross_references"
                    target="new_name_id"
                    {...props}
                  >
                    <EditableDatagrid
                      undoable
                      /* eslint-disable-next-line max-len */
                      className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                      createForm={
                        <CrossReferenceRowForm
                          source="old_name_id"
                          initialValues={oldNameInitialValues}
                          {...props}
                        />
                      }
                      editForm={
                        <CrossReferenceRowForm
                          source="old_name_id"
                          {...props}
                        />
                      }
                      hasCreate
                      expand={<EmbeddedCrossReferenceShow />}
                      noDelete={
                        !canAccess({
                          permissions,
                          action: 'delete',
                          resource: 'cross_references',
                        })
                      }
                    >
                      <SelectField
                        source="cross_reference_type"
                        choices={CrossRefType}
                      />
                      <ReferenceField
                        source="old_name_id"
                        reference="taxon_names"
                        sortBy="cross_reference_type"
                        link="show"
                      >
                        <FormattedScientificNameWithStatus />
                      </ReferenceField>
                      <TextField source="reference_comments" />
                    </EditableDatagrid>
                  </ReferenceManyField>
                )) || (
                  <Typography>
                    You need to save the record before you can add any related
                    names.
                  </Typography>
                )}
              </Labeled>
            </Box>
            <Box className={gridClasses.EightCol1to9span}>
              <Labeled label="Subsequent names">
                {(props.record?.id && (
                  <ReferenceManyField
                    fullWidth
                    reference="cross_references"
                    target="old_name_id"
                    {...props}
                  >
                    <EditableDatagrid
                      /* eslint-disable-next-line max-len */
                      className={`${classes.bottomMargin} ${globalClasses.equalColumnWidth}`}
                      createForm={
                        <CrossReferenceRowForm
                          source="new_name_id"
                          initialValues={newNameInitialValues}
                          {...props}
                        />
                      }
                      editForm={
                        <CrossReferenceRowForm
                          source="new_name_id"
                          {...props}
                        />
                      }
                      hasCreate
                      expand={<EmbeddedCrossReferenceShow />}
                      noDelete={
                        !canAccess({
                          permissions,
                          action: 'delete',
                          resource: 'cross_references',
                        })
                      }
                    >
                      <SelectField
                        source="cross_reference_type"
                        choices={CrossRefType}
                      />
                      <ReferenceField
                        source="new_name_id"
                        reference="taxon_names"
                        sortBy="cross_reference_type"
                        link="show"
                      >
                        <FormattedScientificNameWithStatus />
                      </ReferenceField>
                      <TextField source="reference_comments" />
                    </EditableDatagrid>
                  </ReferenceManyField>
                )) || (
                  <Typography>
                    You need to save the record before you can add any related
                    names.
                  </Typography>
                )}
              </Labeled>
            </Box>
          </Box>
        </FormTab>
        <FormTab label="Notes" path="notes" className={globalClasses.bold}>
          <Box
            /* eslint-disable-next-line max-len */
            className={`${globalClasses.mainGrid} ${globalClasses.sectionMargin}`}
          >
            <Typography
              variant="h5"
              /* eslint-disable-next-line max-len */
              className={`${gridClasses.EightCol1to5span} ${globalClasses.bold}`}
              gutterBottom
            >
              Taxon Name - Notes
            </Typography>
            <TextInput
              source="comments"
              className={gridClasses.EightCol1to9span}
              multiline
              fullWidth
            />
          </Box>
        </FormTab>
      </TabbedForm>
    </>
  );
};

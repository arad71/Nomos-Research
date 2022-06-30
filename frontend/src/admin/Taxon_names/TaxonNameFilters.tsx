import React from 'react';
import {
  DateInput,
  BooleanInput,
  NumberInput,
  ReferenceArrayInput,
  SearchInput,
  SelectArrayInput,
  TextInput,
} from 'react-admin';
import TaxonRank from './TaxonRank';
import PublicationStatus from './PublicationStatus';
import { AutocompleteArrayInput, minValue, number } from 'react-admin';

const validateNumber = [number(), minValue(0)];

export const TaxonNameFilters = [
  <SearchInput source="q" alwaysOn />,
  <NumberInput
    source="id"
    label="Taxon name ID"
    min={0}
    validate={validateNumber}
  />,
  <TextInput source="legacy_id__contains" label="Legacy ID" />,
  <TextInput source="scientific_name__contains" label="Scientific name" />,
  <TextInput source="author__contains" label="Author" />,
  <NumberInput
    source="form_desc_yr"
    label="Year published"
    min={0}
    validate={validateNumber}
  />,
  <TextInput source="publication___title__contains" label="Publication name" />,
  <TextInput
    source="volume_information__contains"
    label="Volume information"
  />,
  <TextInput source="all_vernaculars__contains" label="Vernacular" />,
  <TextInput source="phylum__contains" label="Phylum" />,
  <TextInput source="taxon_class__contains" label="Class" />,
  <TextInput source="order__contains" label="Order" />,
  <TextInput source="family__contains" label="Family" />,
  <TextInput source="genus__contains" label="Genus" />,
  <TextInput source="subgenus__contains" label="Subgenus" />,
  <TextInput source="species__contains" label="Species" />,
  <TextInput source="subspecies__contains" label="Subspecies" />,
  <TextInput source="uninomial__contains" label="Uninomial" />,
  <TextInput
    source="infraspecific_epithet__contains"
    label="Infraspecific epithet"
  />,
  <TextInput
    source="cross_referenced_old_name___new_name___scientific_name__contains"
    label="Accepted name"
  />,
  <ReferenceArrayInput
    source="kingdom_id"
    reference="kingdoms"
    sort={{ field: 'kingdom_name', order: 'ASC' }}
  >
    <SelectArrayInput optionText="kingdom_name" />
  </ReferenceArrayInput>,
  <SelectArrayInput
    source="taxon_rank___rank_name"
    label="Taxon rank"
    choices={TaxonRank}
    helpText="Choose a taxon rank"
  />,
  <ReferenceArrayInput
    label="Informal group"
    source="informal_groups___classification_system___classification_system_id"
    reference="classification_systems"
    filter={{ class_type: 'informal' }}
    sort={{ field: 'class_desc', order: 'ASC' }}
  >
    <SelectArrayInput optionText="class_desc" />
  </ReferenceArrayInput>,
  <BooleanInput label="Is current?" source="is_current" />,
  <BooleanInput label="Is validated?" source="validated" />,
  <SelectArrayInput source="publication_status" choices={PublicationStatus} />,

  <DateInput source="created_on" />,

  <TextInput source="admin_comment__contains" label="Admin Comment" />,

  <ReferenceArrayInput
    source="created_by"
    reference="users"
    sort={{ field: 'full_name', order: 'ASC' }}
  >
    <AutocompleteArrayInput optionText="full_name" />
  </ReferenceArrayInput>,
  <DateInput source="updated_on" />,

  <ReferenceArrayInput
    source="updated_by"
    reference="users"
    sort={{ field: 'full_name', order: 'ASC' }}
  >
    <AutocompleteArrayInput optionText="full_name" />
  </ReferenceArrayInput>,
  <BooleanInput label="Soft deleted?" source="deleted" />,
];

import React from 'react';
import {
  DateInput,
  NullableBooleanInput,
  NumberInput,
  ReferenceArrayInput,
  SearchInput,
  SelectArrayInput,
  TextInput,
} from 'react-admin';
import TaxonRank from './TaxonRank';
import PublicationStatus from './PublicationStatus';
import { AutocompleteArrayInput } from 'react-admin';

export const TaxonNameFilters = [
  <SearchInput source="q" alwaysOn />,
  <NumberInput source="id" label="Taxon name ID" />,
  <NumberInput source="legacy_id" label="Legacy ID" />,
  <TextInput source="scientific_name__contains" />,
  <TextInput source="author__contains" />,
  <NumberInput source="form_desc_yr" label="Year published" />,
  <TextInput source="publication___title__contains" label="Publication name" />,
  <TextInput source="volume_information__contains" />,
  <TextInput
    source="vernaculars___vernacular__contains"
    label="Vernacular contains"
  />,
  <TextInput source="phylum__contains" />,
  <TextInput source="taxon_class__contains" />,
  <TextInput source="order__contains" />,
  <TextInput source="family__contains" />,
  <TextInput source="genus__contains" />,
  <TextInput source="subgenus__contains" />,
  <TextInput source="species__contains" />,
  <TextInput source="subspecies__contains" />,
  <TextInput source="uninomial__contains" />,
  <TextInput source="specific_epithet__contains" />,
  <TextInput source="infraspecific_epithet__contains" />,
  <TextInput
    source="cross_referenced_old_name___new_name___scientific_name__contains"
    label="Accepted name contains"
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
  <NullableBooleanInput label="Is current?" source="is_current" />,
  <NullableBooleanInput label="Is validated?" source="validated" />,
  <SelectArrayInput source="publication_status" choices={PublicationStatus} />,

  <DateInput source="created_on" />,

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
];

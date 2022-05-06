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

export const TaxonNameFilters = [
  <SearchInput source="q" alwaysOn />,
  <NumberInput source="id" label="Taxon name ID" />,
  <NumberInput source="legacy_id" label="Legacy ID" />,
  <TextInput source="scientific_name__contains" />,
  <TextInput source="author__contains" />,
  <NumberInput source="form_desc_yr" label="Year published" />,
  <TextInput
    source="publication___publication_name__contains"
    label="Publication name"
  />,
  <TextInput source="volume_information__contains" />,
  <TextInput source="vernaculars___vernacular__contains" label="Vernacular" />,
  <TextInput source="phylum__contains" />,
  <TextInput source="taxon_class__contains" />,
  <TextInput source="order__contains" />,
  <TextInput source="family__contains" />,
  <TextInput source="genus__contains" />,
  <TextInput source="subgenus__contains" />,
  <TextInput source="species__contains" />,
  <TextInput source="subspecies__contains" />,
  <TextInput source="specific_epithet__contains" />,
  <TextInput source="infraspecific_epithet__contains" />,
  <TextInput
    source="cross_referenced_old_name___new_name___scientific_name__contains"
    label="Related new name"
  />,
  <ReferenceArrayInput source="kingdom_id" reference="kingdoms">
    <SelectArrayInput
      options={{ autoWidth: false }}
      optionText="kingdom_name"
    />
  </ReferenceArrayInput>,
  <SelectArrayInput
    options={{ autoWidth: false }}
    source="taxon_rank___rank_name"
    label="Taxon rank"
    choices={TaxonRank}
    helpText="Choose a taxon rank"
  />,
  <NullableBooleanInput label="Is current?" source="is_current" />,
  <NullableBooleanInput label="Is validated?" source="validated" />,
  <SelectArrayInput
    options={{ autoWidth: false }}
    source="publication_status"
    choices={PublicationStatus}
  />,

  <DateInput source="created_on" />,
  <DateInput source="updated_on" />,
  <ReferenceArrayInput
    label="Informal group"
    source="informal_groups___classification_system___classification_system_id"
    reference="classification_systems"
    filter={{ class_type: 'informal' }}
  >
    <SelectArrayInput options={{ autoWidth: false }} optionText="class_desc" />
  </ReferenceArrayInput>,
];

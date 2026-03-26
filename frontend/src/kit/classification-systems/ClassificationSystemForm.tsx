import * as React from 'react';
import { minValue, required } from 'ra-core';
import { NumberInput } from '@/components/admin/number-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import ClassificationType from '../../admin/Classification_systems/ClassificationType';

const requiredValue = required();
const minZero = minValue(0);
const EMPTY_CHOICE = '__empty__';

const preferredChoices = [
  { id: EMPTY_CHOICE, name: '' },
  { id: 'true', name: 'Yes' },
  { id: 'false', name: 'No' },
];

const parseNullableBoolean = (value: string) => {
  if (value === EMPTY_CHOICE) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const formatNullableBoolean = (value: boolean | null | undefined) => {
  if (value === null || value === undefined) return EMPTY_CHOICE;
  return value ? 'true' : 'false';
};

const ClassificationSystemForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
      <TextInput source="class_desc" validate={requiredValue} />
      <SelectInput
        source="class_type"
        choices={ClassificationType}
        validate={requiredValue}
      />
      <SelectInput
        source="preferred"
        label="Preferred"
        choices={preferredChoices}
        parse={parseNullableBoolean}
        format={formatNullableBoolean}
      />
      <NumberInput
        source="sort_order"
        min={0}
        validate={minZero}
      />
    </div>
  </SimpleForm>
);

export default ClassificationSystemForm;

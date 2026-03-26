import * as React from 'react';
import { required } from 'ra-core';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import ConservationType from '../../admin/Conservation_codes/ConservationType';

const requiredValue = required();

const ConservationCodeForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TextInput
        source="conservation_code_value"
        label="Conservation code"
        validate={requiredValue}
      />
      <SelectInput
        source="authorising_org"
        label="Authority"
        choices={ConservationType}
        validate={requiredValue}
      />
      <TextInput
        source="code_priority"
        label="Display order"
        validate={requiredValue}
      />
    </div>
  </SimpleForm>
);

export default ConservationCodeForm;

import * as React from 'react';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';

const KingdomForm = () => (
  <SimpleForm className="max-w-none">
    <div className="grid gap-4 max-w-4xl">
      <TextInput source="kingdom_name" />
      <TextInput source="kingdom_desc" multiline rows={5} />
    </div>
  </SimpleForm>
);

export default KingdomForm;

import * as React from 'react';
import { Create } from '@/components/admin/create';
import ConservationCodeForm from './ConservationCodeForm';

const ConservationCodeCreatePage = () => (
  <Create
    resource="conservation_codes"
    title="Create conservation code"
    mutationMode="pessimistic"
    redirect="show"
  >
    <ConservationCodeForm />
  </Create>
);

export default ConservationCodeCreatePage;

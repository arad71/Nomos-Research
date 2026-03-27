import * as React from 'react';
import { Create } from '@/components/admin/create';
import KingdomForm from './KingdomForm';

const KingdomCreatePage = () => (
  <Create
    resource="kingdoms"
    title="Create kingdom"
    mutationMode="pessimistic"
  >
    <KingdomForm />
  </Create>
);

export default KingdomCreatePage;

import * as React from 'react';
import { Create } from '@/components/admin/create';
import CitationForm from './CitationForm';

const CitationCreatePage = () => (
  <Create
    resource="citations"
    title="Create citation"
    mutationMode="pessimistic"
    defaultValues={{ author_order: 0 }}
  >
    <CitationForm />
  </Create>
);

export default CitationCreatePage;

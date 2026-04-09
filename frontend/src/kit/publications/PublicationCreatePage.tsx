import * as React from 'react';
import { Create } from '@/components/admin/create';
import PublicationForm from './PublicationForm';
import { transformPublicationPayload } from '../shared/publicationDoi';

const PublicationCreatePage = () => (
  <Create
    resource="publications"
    title="Create publication"
    mutationMode="pessimistic"
    redirect="edit"
    defaultValues={{ published: false }}
    transform={transformPublicationPayload}
  >
    <PublicationForm />
  </Create>
);

export default PublicationCreatePage;

import * as React from 'react';
import { useNotify, useRecordContext, useRedirect, useRefresh } from 'ra-core';
import { Edit } from '@/components/admin/edit';
import ConscodeTaxonForm from './ConscodeTaxonForm';
import HistoryInfoBox from './HistoryInfoBox';
import RecordPageActions from './RecordPageActions';

const ConscodeTaxonEditTitle = () => {
  const record = useRecordContext<{ id?: string | number }>();
  return record?.id != null
    ? `Edit conservation code - taxon link #${record.id}`
    : 'Edit conservation code - taxon link';
};

const ConscodeTaxonEditActions = () => {
  const record = useRecordContext<{ id?: string | number }>();

  return (
    <RecordPageActions
      resource="conscode_taxons"
      listTo="/conscode_taxons"
      showTo={record?.id != null ? `/conscode_taxons/${record.id}/show` : null}
    />
  );
};

const ConscodeTaxonEditPage = () => {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();

  return (
    <Edit
      resource="conscode_taxons"
      title={<ConscodeTaxonEditTitle />}
      mutationMode="pessimistic"
      actions={<ConscodeTaxonEditActions />}
      mutationOptions={{
        onSuccess: (data: { taxon_name_id?: number } | { data?: { taxon_name_id?: number } }) => {
          const taxonNameId = data?.taxon_name_id ?? data?.data?.taxon_name_id;
          notify('Changes saved');
          if (taxonNameId) {
            redirect(`/taxon_names_code/${taxonNameId}`);
          } else {
            redirect('/conscode_taxons');
          }
          refresh();
        },
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ConscodeTaxonForm />
        <div className="xl:sticky xl:top-6 xl:self-start">
          <HistoryInfoBox />
        </div>
      </div>
    </Edit>
  );
};

export default ConscodeTaxonEditPage;

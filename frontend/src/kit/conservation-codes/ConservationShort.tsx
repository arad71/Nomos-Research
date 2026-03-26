import { useRecordContext, Link } from 'react-admin';
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const ConservationShort = (props: any) => {
  const record = useRecordContext(props);
  if (!record) return null;

  return (
    <>
      {record.authorising_org}:<strong>{record.conservation_code_value}</strong>
    </>
  );
};

export const ConservationShortPill = (props: any) => {
  const record = useRecordContext(props);

  if (!record) return null;

  return (
    <Badge variant="outline" className="mr-1 whitespace-nowrap rounded-full px-3 py-1">
      {record.authorising_org}:<strong>{record.conservation_code_value}</strong>
    </Badge>
  );
};

export const ConservationShortPillAdd = (props: any) => {
  const record = useRecordContext(props);

  if (!record) return null;

  return (
    <Link
      to={{
        pathname: '/conscode_taxons/create',
        search: `?source=${JSON.stringify({ taxon_name_id: record.id })}`,
        state: { record: { taxon_name_id: record.id } },
      }}
      className="mt-4 flex"
    >
      <Badge variant="outline" className="rounded-full px-3 py-1">+</Badge>
    </Link>
  );
};

import * as React from 'react';
import { useRecordContext } from 'ra-core';
import { DateField } from '@/components/admin/date-field';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type HistoryRecord = {
  deleted?: boolean | null;
  created_on?: string | null;
  created_by?: string | number | null;
  updated_on?: string | null;
  updated_by?: string | number | null;
};

const HistoryInfoBox = () => {
  const record = useRecordContext<HistoryRecord>();

  if (!record) {
    return null;
  }

  return (
    <Card className="gap-4 border-border py-0">
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="text-base">History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        {record.deleted ? <Badge variant="destructive">Deleted</Badge> : null}
        <RecordField label="Created on" source="created_on">
          <DateField source="created_on" />
        </RecordField>
        <RecordField label="Created by" source="created_by">
          <ReferenceField source="created_by" reference="users">
            <RecordField source="full_name" label="" />
          </ReferenceField>
        </RecordField>
        <RecordField label="Updated on" source="updated_on">
          <DateField source="updated_on" />
        </RecordField>
        <RecordField label="Updated by" source="updated_by">
          <ReferenceField source="updated_by" reference="users">
            <RecordField source="full_name" label="" />
          </ReferenceField>
        </RecordField>
      </CardContent>
    </Card>
  );
};

export default HistoryInfoBox;

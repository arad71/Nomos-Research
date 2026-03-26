import * as React from 'react';
import { useGetList } from 'react-admin';
import { useRecordContext } from 'ra-core';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecordField } from '@/components/admin/record-field';
import { ReferenceArrayField } from '@/components/admin/reference-array-field';
import { ReferenceField } from '@/components/admin/reference-field';
import { ReferenceManyField } from '@/components/admin/reference-many-field';
import { SingleFieldList } from '@/components/admin/single-field-list';

const HtmlValue = ({ value }: { value?: string | null }) => {
  if (!value) return null;
  return <span dangerouslySetInnerHTML={{ __html: value }} />;
};

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm text-muted-foreground">{children}</div>
);

const SidebarCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="gap-4 border-border py-0">
    <CardHeader className="border-b border-border px-5 py-4">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 px-5 pb-5">{children}</CardContent>
  </Card>
);

type TaxonHierarchyRow = {
  id: string | number;
  taxon_name_id?: string | number | null;
  rank_name?: string | null;
  taxon_name?: {
    formatted_scientific_name?: string | null;
  } | null;
};

const TaxonHierarchyCard = ({
  path,
}: {
  path?: string | string[] | null;
}) => {
  const navigate = useNavigate();
  const filter = React.useMemo(() => {
    if (!path) return null;
    return {
      path__ancestor_of: path,
      taxon_name___scientific_name__gt: '',
    };
  }, [path]);

  const { data = [], isLoading } = useGetList<TaxonHierarchyRow>('hierarchies', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'path', order: 'ASC' },
    filter: filter ?? {},
  }, {
    enabled: Boolean(filter),
  });

  if (!filter) {
    return <EmptyState>No hierarchy available.</EmptyState>;
  }

  if (isLoading) {
    return <EmptyState>Loading hierarchy...</EmptyState>;
  }

  if (!data.length) {
    return <EmptyState>No hierarchy available.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div
          key={row.id}
          className="min-w-0 space-y-1 border-b border-border pb-3 last:border-b-0 last:pb-0"
          onDoubleClick={() => {
            if (row.taxon_name_id != null) {
              navigate(`/taxon_names/${row.taxon_name_id}/show`);
            }
          }}
        >
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {row.rank_name || ''}
          </div>
          <div className="min-w-0 break-words text-sm [&_span]:break-words [&_i]:break-words">
            <HtmlValue value={row.taxon_name?.formatted_scientific_name} />
          </div>
        </div>
      ))}
    </div>
  );
};

const TaxonNameSidebarCards = () => {
  const record = useRecordContext<{ path?: string | string[] | { path?: string | string[] } | null }>();

  const hierarchyPath = React.useMemo(() => {
    if (!record?.path) return null;
    return typeof record.path === 'object' && 'path' in record.path ? record.path.path : record.path;
  }, [record]);

  return (
    <div className="grid min-w-0 gap-6">
      <SidebarCard title="Informal Groups">
        <ReferenceArrayField reference="classification_systems" source="classification_system_ids">
          <SingleFieldList className="flex flex-wrap gap-2">
            <Badge variant="outline" className="max-w-full whitespace-normal break-words text-left">
              <RecordField
                source="class_desc"
                label=""
                className="min-w-0 [&_span]:break-words"
              />
            </Badge>
          </SingleFieldList>
        </ReferenceArrayField>
      </SidebarCard>

      <SidebarCard title="Conservation Code">
        <ReferenceManyField
          reference="conscode_taxons"
          target="taxon_name_id"
          filter={{ effective_to: null }}
          sort={{ field: 'conservation_code___code_priority', order: 'ASC' }}
          empty={<EmptyState>No active conservation codes.</EmptyState>}
        >
          <SingleFieldList linkType={false}>
            <ReferenceField source="conservation_code_id" reference="conservation_codes" link={false}>
              <Badge variant="outline">
                <RecordField source="conservation_code_value" label="" />
              </Badge>
            </ReferenceField>
          </SingleFieldList>
        </ReferenceManyField>
      </SidebarCard>

      <SidebarCard title="Taxon Hierarchy">
        <TaxonHierarchyCard path={hierarchyPath} />
      </SidebarCard>
    </div>
  );
};

export default TaxonNameSidebarCards;

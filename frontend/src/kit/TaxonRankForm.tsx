import * as React from 'react';
import { required } from 'ra-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { BooleanInput } from '@/components/admin/boolean-input';
import { ReferenceInput } from '@/components/admin/reference-input';
import { SelectInput } from '@/components/admin/select-input';
import { SimpleForm } from '@/components/admin/simple-form';
import { TextInput } from '@/components/admin/text-input';
import RankAbbreviation from '../admin/Taxon_rank/RankAbbreviation';

const requiredValue = required();
const formatRankOption = (choice?: {
  id?: string | number;
  taxon_rank_id?: string | number;
  rank_name?: string;
  kingdom_name?: string;
  kingdom_id?: string | number;
}) => {
  if (!choice?.rank_name) {
    return '';
  }

  const rankId = choice.taxon_rank_id ?? choice.id;
  const kingdomLabel =
    choice.kingdom_name ??
    (choice.kingdom_id != null ? `kingdom ${choice.kingdom_id}` : undefined);

  if (kingdomLabel && rankId != null) {
    return `${choice.rank_name} (${kingdomLabel}, #${rankId})`;
  }
  if (rankId != null) {
    return `${choice.rank_name} (#${rankId})`;
  }
  return choice.rank_name;
};

const TaxonRankFormFields = () => {
  const { setValue } = useFormContext();
  const kingdomId = useWatch({ name: 'kingdom_id' });
  const previousKingdomId = React.useRef<string | number | undefined>(kingdomId);

  React.useEffect(() => {
    if (previousKingdomId.current !== kingdomId) {
      setValue('direct_parent_rank_id', '', { shouldDirty: true });
      setValue('required_parent_rank_id', '', { shouldDirty: true });
      previousKingdomId.current = kingdomId;
    }
  }, [kingdomId, setValue]);

  const parentRankFilter = kingdomId ? { kingdom_id: kingdomId } : undefined;
  const parentRankDisabled = !kingdomId;
  const parentRankHelperText = kingdomId ? undefined : 'Select a kingdom first';

  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-2">
      <ReferenceInput
        source="kingdom_id"
        reference="kingdoms"
        sort={{ field: 'kingdom_name', order: 'ASC' }}
      >
        <SelectInput label="Kingdom" optionText="kingdom_name" validate={requiredValue} />
      </ReferenceInput>
      <TextInput source="rank_name" label="Rank name" validate={requiredValue} />
      <SelectInput source="rank_abbrev" label="Rank abbreviation" choices={RankAbbreviation} />
      <ReferenceInput
        source="direct_parent_rank_id"
        reference="taxon_ranks"
        sort={{ field: 'rank_name', order: 'ASC' }}
        filter={parentRankFilter}
      >
        <AutocompleteInput
          label="Direct parent rank"
          optionText={formatRankOption}
          disabled={parentRankDisabled}
          helperText={parentRankHelperText}
        />
      </ReferenceInput>
      <ReferenceInput
        source="required_parent_rank_id"
        reference="taxon_ranks"
        sort={{ field: 'rank_name', order: 'ASC' }}
        filter={parentRankFilter}
      >
        <AutocompleteInput
          label="Req. parent rank"
          optionText={formatRankOption}
          disabled={parentRankDisabled}
          helperText={parentRankHelperText}
        />
      </ReferenceInput>
      <BooleanInput source="uninomial" label="Uninomial" defaultValue={false} />
    </div>
  );
};

const TaxonRankForm = () => (
  <SimpleForm className="max-w-none">
    <TaxonRankFormFields />
  </SimpleForm>
);

export default TaxonRankForm;

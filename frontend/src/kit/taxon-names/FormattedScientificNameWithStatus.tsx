import { RichTextField, useRecordContext } from 'react-admin';
import React from 'react';
import { GlobalTheme } from '../../GlobalTheme';
import { InfragenericData } from './infrageneric/TaxonTypes';
import useFetchInfragenericNames from './infrageneric/useFetchInfragenericNames';
import { TaxonName } from './TaxonName';
import { TaxonNameStatus } from './TaxonNameStatus';

type FormattedScientificNameWithStatusProps = {
  id?: number;
  truncate?: boolean;
  record?: TaxonName;
};

export const FormattedScientificNameWithStatus = ({
  truncate = false,
  record: recordProp,
}: FormattedScientificNameWithStatusProps) => {
  const record = recordProp || useRecordContext();
  const idValue = record?.id;
  const id = idValue !== undefined && idValue !== null ? Number(idValue) : NaN;
  const safeId = Number.isNaN(id) ? 0 : id;
  const globalClasses = GlobalTheme();
  const { loading, infragenericNames } = useFetchInfragenericNames(safeId);

  if (!record || loading) return null;

  const infragenus = infragenericNames?.infrageneric_names.find(
    (d: InfragenericData) => d.name_version === 'Infragenus with rank'
  );

  return (
    <>
      <span className={truncate ? globalClasses.titleTruncation : ''}>
        {(infragenus && (
          <span
            className="font-bold text-base"
            dangerouslySetInnerHTML={{ __html: infragenus.italicized_name }}
          />
        )) || (
          <RichTextField
            source="formatted_scientific_name"
            className="font-bold text-base"
          />
        )}
      </span>
      <TaxonNameStatus />
    </>
  );
};

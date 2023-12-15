import { RichTextField, useRecordContext } from 'react-admin';
import React from 'react';
import { TaxonNameStatus } from './TaxonNameStatus';
import { makeStyles } from '@material-ui/core/styles';
import { GlobalTheme } from '../../GlobalTheme';
import { TaxonName } from './TaxonName';
import { InfragenericData } from './TaxonTypes';
import useFetchInfragenericNames from './useFetchInfragenericNames';

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    fontSize: '1em',
  },
});
type FormattedScientificNameWithStatusProps = {
  id?: number;
  truncate?: boolean;
  record?: TaxonName;
};
export const FormattedScientificNameWithStatus = ({
  truncate = false,
}: FormattedScientificNameWithStatusProps) => {
  const record = useRecordContext();
  const id = parseInt(record.id);
  const classes = useStyles();
  const globalClasses = GlobalTheme();

  const { loading, infragenericNames } = useFetchInfragenericNames(id);
  if (loading) return null;
  const infragenus = infragenericNames?.infrageneric_names.find(
    (d: InfragenericData) => d.name_version === 'Infragenus with rank'
  );
  return (
    <>
      <span className={truncate ? globalClasses.titleTruncation : ''}>
        {(infragenus && (
          <span
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: infragenus.italicized_name }}
          />
        )) || (
          <RichTextField
            source="formatted_scientific_name"
            className={classes.title}
          />
        )}
      </span>
      <TaxonNameStatus />
    </>
  );
};

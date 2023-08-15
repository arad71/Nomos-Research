import { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import { InfragenericNamesData } from './TaxonTypes';
import { DataProvider, GetOneResult } from 'ra-core/lib/types';

const useFetchInfragenericNames = (id: number) => {
  const dataProvider: DataProvider = useDataProvider();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();
  const [infragenericNames, setInfragenericNames] =
    useState<InfragenericNamesData>({ id: 0, infrageneric_names: [] });

  useEffect(() => {
    if (isNaN(id) || !id) return setLoading(false);

    dataProvider
      .getOne<InfragenericNamesData>('taxon_names_infrageneric_names', {
        id: id,
      })
      .then(({ data }: GetOneResult<InfragenericNamesData>) => {
        setInfragenericNames(data);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error(error);
        setError(error);
        setLoading(false);
      });
  }, [id]);

  return { loading, error, infragenericNames };
};

export default useFetchInfragenericNames;

import { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import type { DataProvider, GetOneResult } from 'ra-core';
import { InfragenericNamesData } from './TaxonTypes';

const useFetchInfragenericNames = (id: number) => {
  const dataProvider: DataProvider = useDataProvider();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>();
  const [infragenericNames, setInfragenericNames] =
    useState<InfragenericNamesData>({ id: 0, infrageneric_names: [] });

  useEffect(() => {
    if (isNaN(id) || !id) {
      setLoading(false);
      setInfragenericNames({ id: 0, infrageneric_names: [] });
      return;
    }

    setLoading(true);

    dataProvider
      .getOne<InfragenericNamesData>('taxon_names_infrageneric_names', {
        id: id,
      })
      .then(({ data }: GetOneResult<InfragenericNamesData>) => {
        setError(undefined);
        setInfragenericNames(data);
        setLoading(false);
      })
      .catch((error: Error & { status?: number }) => {
        if (error.status === 404) {
          setError(undefined);
          setInfragenericNames({ id, infrageneric_names: [] });
          setLoading(false);
          return;
        }

        console.error(error);
        setError(error);
        setLoading(false);
      });
  }, [dataProvider, id]);

  return { loading, error, infragenericNames };
};

export default useFetchInfragenericNames;

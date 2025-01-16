import { useRecordContext, Link } from 'react-admin';
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold',
  },
  pill: {
    background: 'rgba(44, 83, 49, 0.2)',
    borderRadius: '1rem',
    padding: '0.3rem 1rem',
    marginRight: '0.3rem',
    textWrap: 'nowrap',
  },
  container: {
    display: 'flex',
    marginBlockStart: '1rem',
  },
});

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
  const classes = useStyles();

  if (!record) return null;
  return (
    <span className={classes.pill}>
      {record.authorising_org}:<strong>{record.conservation_code_value}</strong>
    </span>
  );
};

export const ConservationShortPillAdd = (props: any) => {
  const record = useRecordContext(props);
  const classes = useStyles();

  if (!record) return null;
  return (
    <Link
      to={{
        pathname: '/conscode_taxons/create',
        search: `?source=${JSON.stringify({ taxon_name_id: record.id })}`,
        state: { record: { taxon_name_id: record.id } },
      }}
      className={classes.container}
    >
      <span className={classes.pill}>+</span>
    </Link>
  );
};

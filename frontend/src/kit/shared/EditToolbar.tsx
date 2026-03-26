import React from 'react';
import { DeleteWithConfirmButton, SaveButton, Toolbar } from 'react-admin';
import { CanAccess as IfCanAccess } from 'react-admin';
import { useRecordContext } from 'react-admin';

const EditToolbar = (props: { resource: string }) => {
  const record = useRecordContext();
  const hasRecordId = Boolean(record && record.id);

  return (
    <Toolbar
      className="justify-between"
      {...props}
    >
      <div className="flex items-center gap-3">
        {/* @ts-ignore */}
        <SaveButton
          disabled={props.pristine}
          variant="contained"
          label="Save changes"
        />
        {hasRecordId && (
          <IfCanAccess resource={props.resource} action="delete">
            <DeleteWithConfirmButton
              mutationMode="pessimistic"
              variant="outlined"
              label="Delete"
            />
          </IfCanAccess>
        )}
      </div>
    </Toolbar>
  );
};

export default EditToolbar;

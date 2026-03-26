import React from 'react';
import { Button } from 'react-admin';
import { usePreferences } from '@react-admin/ra-preferences';
import { Undo } from '@mui/icons-material';

const ResetPreferenceButton: React.FC<{
  preferenceName: string;
  defaultValue: any;
  label: string;
}> = ({ preferenceName, defaultValue, label }) => {
  const [currentValue, setPreference] = usePreferences(preferenceName);

  const resetPreference = (): void => {
    setPreference(defaultValue);
  };

  return (
    <Button onClick={resetPreference} label={label}>
      <Undo />
    </Button>
  );
};

export default ResetPreferenceButton;

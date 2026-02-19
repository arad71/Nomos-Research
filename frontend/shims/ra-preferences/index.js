const React = require('react');
const { useStore } = require('react-admin');

const usePreferences = (key, defaultValue) => useStore(key, defaultValue);

const useSelectedColumns = ({ preferences, columns, omit = [] }) => {
  const defaultColumns = Object.keys(columns).filter(
    (columnName) => !omit.includes(columnName)
  );
  const [selectedColumns] = useStore(preferences, defaultColumns);
  return (selectedColumns || []).map((columnName) => columns[columnName]).filter(Boolean);
};

const SelectColumnsButton = () => null;

module.exports = {
  SelectColumnsButton,
  usePreferences,
  useSelectedColumns,
};

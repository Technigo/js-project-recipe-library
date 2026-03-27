import React from 'react';

interface Props {
  onSortChange: (sortBy: string) => void;
}

const Sort: React.FC<Props> = ({ onSortChange }) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value);
  };

  return (
    <div className="sort">
      <select onChange={handleSelectChange}>
        <option value="none">Sort by</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
};

export default Sort;

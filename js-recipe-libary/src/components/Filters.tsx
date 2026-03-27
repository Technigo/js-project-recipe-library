import React from 'react';

interface Props {
  onFilterChange: (filters: any) => void;
}

const Filters: React.FC<Props> = ({ onFilterChange }) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    onFilterChange((prevFilters: any) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  return (
    <div className="filters">
      <label>
        <input type="checkbox" name="vegetarian" onChange={handleCheckboxChange} />
        Vegetarian
      </label>
      <label>
        <input type="checkbox" name="vegan" onChange={handleCheckboxChange} />
        Vegan
      </label>
      <label>
        <input type="checkbox" name="glutenFree" onChange={handleCheckboxChange} />
        Gluten-Free
      </label>
      <label>
        <input type="checkbox" name="dairyFree" onChange={handleCheckboxChange} />
        Dairy-Free
      </label>
    </div>
  );
};

export default Filters;

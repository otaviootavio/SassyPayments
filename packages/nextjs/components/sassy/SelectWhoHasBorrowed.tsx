import React from "react";
import { Address } from "../scaffold-eth";

interface SelectWhoHasBorrowedProps {
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  options: string[];
}

const SelectWhoHasBorrowed: React.FC<SelectWhoHasBorrowedProps> = ({ selectedValues, setSelectedValues, options }) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedValues([...selectedValues, event.target.value]);
    } else {
      setSelectedValues(selectedValues.filter(value => value !== event.target.value));
    }
  };

  return (
    <div>
      {options?.map((option: string) => (
        <label key={option} htmlFor={option} className="label cursor-pointer">
          <span className="label-text mr-2">
            {" "}
            <Address disableAddressLink={true} hasCopyIcon={false} format="short" address={option} />
          </span>
          <input
            type="checkbox"
            id={option}
            name="customCheckbox"
            value={option}
            checked={selectedValues.includes(option)}
            onChange={handleCheckboxChange}
            className="checkbox checkbox-primary"
          />
        </label>
      ))}
    </div>
  );
};

export default SelectWhoHasBorrowed;

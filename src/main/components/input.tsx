import { TextField } from "@mui/material";
import React, { HTMLInputTypeAttribute } from "react";

type InputProps = {
  name?: string;
  label: string;
  value: string;
  type?: HTMLInputTypeAttribute;
  multiline?: boolean;
  onChange: (value: string | null) => void;
};
const Input = (props: InputProps) => {
  const {
    name,
    label,
    value,
    onChange,
    type = "text",
    multiline = false,
  } = props;
  return (
    <TextField
      id="outlined-basic"
      label={label}
      variant="outlined"
      fullWidth
      type={type}
      multiline={multiline}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
      }}
    />
  );
};
export default Input;

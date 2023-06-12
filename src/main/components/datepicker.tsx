import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
type DatePickerInputProps = {
  name?: string;
  label: string;
  value: string | undefined;
  minValue?: string;
  maxValue?: string;
  onChange: (value: string | null) => void;
};

const DatePickerInput = (props: DatePickerInputProps) => {
  const { name, label, value, onChange, minValue, maxValue } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={(newVal: string | null, _: any) => {
          onChange(newVal);
        }}
        format="DD.MM.YYYY"
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        disableFuture
        slotProps={{
          textField: {
            variant: "standard",
            InputProps: { endAdornment: null },
            fullWidth: true,
            onClick: handleOpen,
          },
          openPickerButton: { sx: { visibility: "hidden" } },
        }}
      />
    </LocalizationProvider>
  );
};
export default DatePickerInput;

export type DatePickerSize = "sm" | "md";

export type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fixedPopover?: boolean;
  allowClear?: boolean;
  showToday?: boolean;
  placeholder?: string;
  size?: DatePickerSize;
  showTime?: boolean;
  min?: string;
};

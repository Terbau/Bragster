import { Input, type InputProps } from "./index";

export type NumberInputProps = InputProps;

export const NumberInput = (props: Omit<NumberInputProps, "type">) => {
  return <Input type="number" {...props} />;
};
NumberInput.displayName = "NumberInput";

import { Input, type InputProps } from ".";

export type TextInputProps = InputProps;

export const TextInput = (props: Omit<TextInputProps, "type">) => {
  return <Input type="text" {...props} />;
};
TextInput.displayName = "TextInput";

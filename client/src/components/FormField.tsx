import { useId } from "react";
import { cn } from "@/lib/utils";

const AUTOCOMPLETE_INFER: Record<string, string> = {
  email: "email",
  tel: "tel",
  telephone: "tel",
  phone: "tel",
  name: "name",
  fullname: "name",
  "full-name": "name",
  username: "username",
  password: "current-password",
};

function inferAutoComplete(
  type: string | undefined,
  name: string
): string | undefined {
  if (type === "email") return "email";
  if (type === "tel") return "tel";
  if (type === "password") return "current-password";
  return AUTOCOMPLETE_INFER[name.toLowerCase()];
}

type FormFieldProps = {
  label: React.ReactNode;
  labelClassName?: string;
  name: string;
} & Omit<React.ComponentProps<"input">, "name"> & {
    autoComplete?: React.ComponentProps<"input">["autoComplete"];
  };

export function FormField({
  label,
  labelClassName,
  autoComplete,
  id,
  name,
  type = "text",
  className,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const resolvedAutoComplete = autoComplete ?? inferAutoComplete(type, name);

  return (
    <label className={cn(labelClassName)}>
      {label}
      <input
        id={fieldId}
        name={name}
        type={type}
        autoComplete={resolvedAutoComplete}
        className={className}
        {...inputProps}
      />
    </label>
  );
}

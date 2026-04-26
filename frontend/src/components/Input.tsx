import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, id, ...props }, ref) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} ref={ref} {...props} />
    </label>
  );
});

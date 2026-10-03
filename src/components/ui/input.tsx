import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldStyles = cn(
  "w-full rounded-sm border-[3px] border-border bg-background px-4 py-3 text-body text-foreground",
  "placeholder:text-foreground/40",
  "transition-all duration-150",
  "focus:outline-none focus:shadow-brutal-sm",
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brutal-blue",
  "disabled:opacity-50"
);

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, "resize-y", className)} {...props} />;
}

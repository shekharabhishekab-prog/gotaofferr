import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export function PasswordInput({ className, label, id, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type={show ? "text" : "password"}
        className="pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:text-foreground"
      >
        {show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </div>
  );
}

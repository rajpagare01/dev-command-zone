import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PasswordField = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff /> : <Eye />}</Button></div>;
});
PasswordField.displayName = "PasswordField";

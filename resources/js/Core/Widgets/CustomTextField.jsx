import React, { useState } from 'react';
import { cn } from '../utils';
import { Eye, EyeOff } from 'lucide-react';

export default function CustomTextField({
 label,
 hintText,
 isPassword = false,
 value,
 onChange,
 type = 'text',
 prefixIcon: PrefixIcon,
 suffixIcon: SuffixIcon,
 className,
 error,
 ...props
}) {
 const [obscureText, setObscureText] = useState(isPassword);

 return (
 <div className={cn("w-full flex flex-col gap-1.5", className)}>
 {label && (
 <label className="text-sm font-semibold text-text-base ">
 {label}
 </label>
 )}
 <div className="relative">
 {PrefixIcon && (
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <PrefixIcon className="h-5 w-5 text-text-muted " />
 </div>
 )}
 <input
 type={isPassword ? (obscureText ? 'password' : 'text') : type}
 value={value}
 onChange={onChange}
 placeholder={hintText}
 className={cn(
 "w-full rounded-md border border-border-base bg-bg-card px-4 py-3.5 text-text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
 PrefixIcon ? "pl-11" : "",
 (isPassword || SuffixIcon) ? "pr-11" : "",
 error ? "border-danger focus:border-danger focus:ring-danger " : ""
 )}
 {...props}
 />
 {isPassword ? (
 <button
 type="button"
 onClick={() => setObscureText(!obscureText)}
 className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-muted transition-colors"
 >
 {obscureText ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
 </button>
 ) : SuffixIcon ? (
 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
 <SuffixIcon className="h-5 w-5 text-text-muted " />
 </div>
 ) : null}
 </div>
 {error && <p className="text-sm text-danger">{error}</p>}
 </div>
 );
}

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
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {PrefixIcon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <PrefixIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <input
                    type={isPassword ? (obscureText ? 'password' : 'text') : type}
                    value={value}
                    onChange={onChange}
                    placeholder={hintText}
                    className={cn(
                        "w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 transition-colors",
                        PrefixIcon ? "pl-11" : "",
                        (isPassword || SuffixIcon) ? "pr-11" : "",
                        error ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500" : ""
                    )}
                    {...props}
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setObscureText(!obscureText)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        {obscureText ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                ) : SuffixIcon ? (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <SuffixIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                ) : null}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

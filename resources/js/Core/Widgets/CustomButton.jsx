import React from 'react';
import { cn } from '../utils';

export default function CustomButton({
 children,
 onPressed,
 isLoading = false,
 className,
 variant = 'primary', // primary, secondary, danger, outline
 icon: Icon,
 ...props
}) {
 const baseStyles = "inline-flex items-center justify-center rounded-md px-6 py-4 font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
 
 const variants = {
  primary: "bg-primary text-bg-card hover:bg-primary-hover hover:shadow-lg",
  secondary: "bg-bg-hover text-text-base hover:bg-border-base border border-transparent hover:border-border-base",
  danger: "bg-danger text-white hover:bg-danger-hover hover:shadow-lg",
  outline: "border border-border-base bg-transparent text-text-base hover:bg-bg-hover"
 };

 return (
 <button
 onClick={onPressed}
 disabled={isLoading}
 className={cn(baseStyles, variants[variant], className)}
 {...props}
 >
 {isLoading ? (
 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 ) : Icon ? (
 <Icon className="mr-2 h-5 w-5" />
 ) : null}
 {children}
 </button>
 );
}

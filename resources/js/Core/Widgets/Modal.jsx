import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '../utils';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }) {
 const maxWidthClass = {
 sm: 'sm:max-w-sm',
 md: 'sm:max-w-md',
 lg: 'sm:max-w-lg',
 xl: 'sm:max-w-xl',
 '2xl': 'sm:max-w-2xl',
 '3xl': 'sm:max-w-3xl',
 '4xl': 'sm:max-w-4xl',
 }[maxWidth];

 return (
 <Transition appear show={isOpen} as={Fragment}>
 <Dialog as="div" className="relative z-[100]" onClose={onClose}>
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0"
 enterTo="opacity-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <div className="fixed inset-0 bg-bg-base/50 backdrop-blur-sm transition-opacity" />
 </Transition.Child>

 <div className="fixed inset-0 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4 text-center">
 <Transition.Child
 as={Fragment}
 enter="ease-out duration-300"
 enterFrom="opacity-0 scale-95"
 enterTo="opacity-100 scale-100"
 leave="ease-in duration-200"
 leaveFrom="opacity-100 scale-100"
 leaveTo="opacity-0 scale-95"
 >
 <Dialog.Panel className={cn(
 "w-full transform overflow-hidden rounded-2xl bg-bg-card p-6 text-left align-middle shadow-2xl transition-all border border-border-base ",
 maxWidthClass
 )}>
 {title && (
 <Dialog.Title
 as="h3"
 className="text-xl font-bold leading-6 text-text-base mb-4"
 >
 {title}
 </Dialog.Title>
 )}
 <div className="mt-2 text-text-base ">
 {children}
 </div>
 </Dialog.Panel>
 </Transition.Child>
 </div>
 </div>
 </Dialog>
 </Transition>
 );
}

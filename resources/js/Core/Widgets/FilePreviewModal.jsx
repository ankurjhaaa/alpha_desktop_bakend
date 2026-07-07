import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, fileUrl, title }) {
    const [zoom, setZoom] = useState(1);
    const [fileType, setFileType] = useState('unknown');

    useEffect(() => {
        if (!isOpen) {
            setZoom(1);
            return;
        }

        // Guess file type from URL
        const url = fileUrl?.toLowerCase() || '';
        if (url.includes('.pdf')) {
            setFileType('pdf');
        } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
            setFileType('image');
        } else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
            setFileType('video');
        } else {
            setFileType('other');
        }

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, fileUrl]);

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-bg-base/95 backdrop-blur-sm transition-opacity">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-bg-card shadow-sm">
                <h2 className="text-lg font-bold text-text-base line-clamp-1 flex-1 pr-4">
                    {title || 'Preview'}
                </h2>
                
                {/* Image Controls */}
                {fileType === 'image' && (
                    <div className="flex items-center space-x-2 mr-6 border-r border-border-base pr-6">
                        <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-base transition-colors" title="Zoom Out">
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-text-base w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-base transition-colors" title="Zoom In">
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button onClick={handleResetZoom} className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-base transition-colors" title="Reset Zoom">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-danger-light text-text-muted hover:text-danger-text transition-colors flex-shrink-0"
                    title="Close"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                {fileType === 'pdf' ? (
                    <iframe 
                        src={fileUrl} 
                        className="w-full h-full rounded-md border border-border-base shadow-sm bg-white"
                        title={title}
                    />
                ) : fileType === 'image' ? (
                    <div className="flex items-center justify-center w-full h-full overflow-auto">
                        <img 
                            src={fileUrl} 
                            alt={title}
                            className="max-w-none transition-transform duration-200 ease-out shadow-lg rounded-md"
                            style={{ 
                                transform: `scale(${zoom})`, 
                                transformOrigin: 'center center',
                                maxHeight: zoom <= 1 ? '100%' : 'none',
                                maxWidth: zoom <= 1 ? '100%' : 'none',
                            }}
                        />
                    </div>
                ) : fileType === 'video' ? (
                    <video 
                        src={fileUrl} 
                        controls 
                        className="max-w-full max-h-full rounded-md shadow-lg"
                        autoPlay
                    />
                ) : (
                    <div className="text-center p-8 bg-bg-card rounded-md border border-border-base">
                        <p className="text-text-base font-medium mb-4">Preview not supported for this file type.</p>
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center py-2.5 px-6 bg-primary hover:bg-primary-hover text-primary-text rounded-md font-medium transition-colors"
                        >
                            Open File in New Tab
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

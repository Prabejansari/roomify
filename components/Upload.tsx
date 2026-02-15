import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS } from 'lib/constants';
import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router';

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {

    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const processFile = useCallback((file: File) => {
        if (!isSignedIn) return;

        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        reader.onerror = () => {
            setFile(null);
            setProgress(0);
            // Optionally: show error message to user
        };
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT;
                    if (next >= 100) {
                        clearInterval(intervalRef.current!);
                        intervalRef.current = null;
                        setTimeout(() => {
                            onComplete?.(base64Data);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                })
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    }, [isSignedIn, onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    }

    const handleDragLeave = () => {
        setIsDragging(false);
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        const dropedFile = e.dataTransfer.files[0];
        if (dropedFile && dropedFile.type.startsWith('image/')) {
            processFile(dropedFile);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            processFile(selectedFile);
        }
    }
    return (
        <div className='upload'>
            {!file ? (
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`dropzone ${isDragging ? 'is-dragging' : ''}`}>
                    <input
                        type="file"
                        className='drop-input'
                        accept='.jpg,.jpeg,.png'
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? ("Click to upload or just drag and drop") : ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className="help">Maximum file size 50MB</p>
                    </div>
                </div>

            ) : (
                <div className='upload-status'>
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className='check' />
                            ) : (
                                <ImageIcon className='image' />
                            )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }}></div>
                            <p className='status-text'>
                                {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Upload

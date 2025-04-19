import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import uploadCloudinary from '@/lib/cloudinary';

const VideoUpload = ({ onVideoUpload }) => {
    const [videoFile, setVideoFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('video/')) {
            toast.error('Please select a valid video file');
            return;
        }
        setVideoFile(file);
    };

    const handleUpload = async () => {
        if (!videoFile || !title) {
            toast.error('Please provide both video and title');
            return;
        }

        setIsUploading(true);
        try {
            // Upload to Cloudinary with isVideo=true
            const videoUrl = await uploadCloudinary(videoFile, true);
            // Ensure we're passing the URL in a format the backend expects
            onVideoUpload({
                url: videoUrl,
                videoUrl: videoUrl, // Add multiple URL properties for compatibility
                source: videoUrl,
                video: videoUrl,
                title
            });
            toast.success('Video uploaded successfully');
            // Reset form
            setVideoFile(null);
            setTitle('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            toast.error('Failed to upload video');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Video Title</label>
                <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Video File</label>
                <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    ref={fileInputRef}
                />
            </div>
            <Button
                onClick={handleUpload}
                disabled={!videoFile || !title || isUploading}
                className="w-full"
            >
                {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
        </div>
    );
};

export default VideoUpload; 
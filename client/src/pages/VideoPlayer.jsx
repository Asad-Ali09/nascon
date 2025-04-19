import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkAuthStatus } from '@/Redux/slices/authSlice';
import { updateVideo } from '@/Redux/slices/courseSlice';
import { toast } from 'sonner';

const VideoPlayer = () => {
    const { courseId, videoId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [video, setVideo] = useState(null);
    const [course, setCourse] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [updateTitle, setUpdateTitle] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const videoRef = React.useRef(null);

    // Get auth and course data from Redux store
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const courses = useSelector((state) => state.course.courses);

    // Check authentication
    useEffect(() => {
        const verifyAuth = async () => {
            if (!user && !isVerifying) {
                setIsVerifying(true);
                try {
                    const resultAction = await dispatch(checkAuthStatus());
                    if (resultAction.type !== checkAuthStatus.fulfilled.type) {
                        navigate("/login");
                    }
                } catch (error) {
                    console.error("Auth verification error:", error);
                    navigate("/login");
                } finally {
                    setIsVerifying(false);
                }
            }
        };

        verifyAuth();
    }, [dispatch, navigate, user, isVerifying]);

    // Load course and video data
    useEffect(() => {
        if (user) {
            const currentCourse = courses.find(c => c._id === courseId);
            if (currentCourse) {
                setCourse(currentCourse);
                const currentVideo = currentCourse.videos.find(v => v._id === videoId);
                if (currentVideo) {
                    // Ensure video URL is properly formatted
                    const videoWithUrl = {
                        ...currentVideo,
                        // Check for all possible URL properties
                        url: currentVideo.url
                    };
                    console.log('Video data:', videoWithUrl); // Debug log
                    setVideo(videoWithUrl);
                    setUpdateTitle(videoWithUrl.title);

                    // Check if transcript is empty and needs processing
                    if (!videoWithUrl.transcript || videoWithUrl.transcript.trim() === '') {
                        setIsTranscriptLoading(true);
                        // Here you could add logic to request transcript generation if needed
                        // For now, we'll just set it to false after a short delay
                        setTimeout(() => {
                            setIsTranscriptLoading(false);
                        }, 1000);
                    }
                } else {
                    toast.error("Video not found");
                    navigate(`/course/${courseId}`);
                }
            } else {
                toast.error("Course not found");
                navigate("/teacher");
            }
        }
    }, [courseId, videoId, courses, user, navigate]);

    // Handle video events
    const handleVideoReady = () => {
        setIsVideoReady(true);
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Error playing video:", error);
                // Don't show error toast for user-initiated playback
                if (error.name !== 'AbortError') {
                    toast.error("Error playing video. Please try again.");
                }
            });
        }
    };

    const handleVideoError = (e) => {
        console.error("Video error:", e);
        console.error("Video element:", videoRef.current);
        console.error("Video URL:", video?.url);
        toast.error("Error loading video. Please try again later.");
    };

    const handleUpdateClick = () => {
        setIsUpdateDialogOpen(true);
    };

    const handleUpdateVideo = async () => {
        if (!video) return;
        if (!updateTitle.trim()) {
            toast.error('Please provide a title');
            return;
        }

        setIsUpdating(true);
        try {
            // Call the updateVideo thunk with the correct data structure
            await dispatch(updateVideo({
                courseId,
                videoId: video._id,
                videoData: {
                    title: updateTitle,
                    url: video.url // Keep the existing URL
                }
            })).unwrap();

            // Update the local state
            setVideo({
                ...video,
                title: updateTitle
            });

            toast.success('Video updated successfully');
            setIsUpdateDialogOpen(false);
        } catch (error) {
            toast.error(error || 'Failed to update video');
        } finally {
            setIsUpdating(false);
        }
    };

    if (authLoading || isVerifying) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl">Loading...</p>
        </div>;
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (!video || !course) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl">Loading course content...</p>
        </div>;
    }

    // Debug log for video URL
    console.log('Rendering video with URL:', video.url);
    console.log('Video transcript:', video.transcript);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-6 space-y-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course
                    </Button>
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                </div>
                {user.role === 'teacher' && (
                    <Button variant="outline" onClick={handleUpdateClick}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Video
                    </Button>
                )}
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardContent className="p-0">
                        <div className="aspect-video">
                            {video.url ? (
                                <video
                                    ref={videoRef}
                                    src={video.url}
                                    controls
                                    className="w-full h-full"
                                    playsInline
                                    onCanPlay={handleVideoReady}
                                    onError={handleVideoError}
                                    crossOrigin="anonymous"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <p className="text-muted-foreground">Video source not available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isTranscriptLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <p className="text-muted-foreground">Loading transcript...</p>
                            </div>
                        ) : video.transcript && video.transcript.trim() !== '' ? (
                            <p className="whitespace-pre-wrap">{video.transcript}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                <p className="text-muted-foreground">No transcript available for this video.</p>
                                <p className="text-sm text-muted-foreground">Transcripts will be generated automatically for new videos.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Video Update Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Video</DialogTitle>
                        <DialogDescription>
                            Update the title for this video
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Video Title</Label>
                            <Input
                                id="title"
                                value={updateTitle}
                                onChange={(e) => setUpdateTitle(e.target.value)}
                                placeholder="Enter video title"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleUpdateVideo}
                            disabled={isUpdating || !updateTitle.trim()}
                        >
                            {isUpdating ? 'Updating...' : 'Update Video'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default VideoPlayer; 
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, FileVideo, ArrowLeft, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { addVideoToCourse, updateVideo, updateVideoOrder } from '@/Redux/slices/courseSlice';
import { checkAuthStatus } from '@/Redux/slices/authSlice';
import VideoUpload from '@/components/VideoUpload';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Video Card Component
const SortableVideoCard = ({ video, onUpdateClick, onVideoClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: video._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className="cursor-move">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div
                            className="cursor-grab p-1 rounded-md hover:bg-muted"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => onUpdateClick(video, e)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                    <div
                        className="aspect-video bg-muted rounded-lg flex items-center justify-center"
                        onClick={() => onVideoClick(video._id)}
                    >
                        <FileVideo className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle
                        className="mt-2"
                        onClick={() => onVideoClick(video._id)}
                    >
                        {video.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {video.transcript && video.transcript.trim() !== '' ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-sm text-muted-foreground">Transcript available</p>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <p className="text-sm text-muted-foreground">No transcript</p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const CourseManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
    const [isVideoUpdateOpen, setIsVideoUpdateOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateFile, setUpdateFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
    const fileInputRef = useRef(null);

    // Get auth and course data from Redux store
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const courses = useSelector((state) => state.course.courses);

    // Configure DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    // Load course data
    useEffect(() => {
        if (user) {
            const currentCourse = courses.find(c => c._id === courseId);
            if (currentCourse) {
                setCourse(currentCourse);
            } else {
                toast.error("Course not found");
                navigate("/teacher");
            }
        }
    }, [courseId, courses, user, navigate]);

    const handleVideoUpload = async (videoData) => {
        try {
            await dispatch(addVideoToCourse({
                courseId,
                videoData
            })).unwrap();
            toast.success('Video added successfully');
            setIsVideoUploadOpen(false);
        } catch (error) {
            toast.error(error || 'Failed to add video');
        }
    };

    const handleVideoClick = (videoId) => {
        navigate(`/course/${courseId}/video/${videoId}`);
    };

    const handleUpdateClick = (video, e) => {
        e.stopPropagation(); // Prevent the click from bubbling to the card
        setSelectedVideo(video);
        setUpdateTitle(video.title);
        setUpdateFile(null);
        setIsVideoUpdateOpen(true);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('video/')) {
            toast.error('Please select a valid video file');
            return;
        }
        setUpdateFile(file);
    };

    const handleUpdateVideo = async () => {
        if (!selectedVideo) return;
        if (!updateTitle.trim()) {
            toast.error('Please provide a title');
            return;
        }
        setIsUpdating(true);
        try {
            let videoData = { title: updateTitle };

            // If a new file is selected, upload it to Cloudinary
            if (updateFile) {
                const formData = new FormData();
                formData.append("file", updateFile);
                formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET_KEY);
                formData.append("resource_type", "video");
                const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudname}/video/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );
                const data = await response.json();
                videoData.url = data.secure_url;
            } else {
                // If no new file is selected, keep the existing URL
                videoData.url = selectedVideo.url;
            }

            // Call the updateVideo thunk with the correct data structure
            await dispatch(updateVideo({
                courseId,
                videoId: selectedVideo._id,
                videoData
            })).unwrap();

            toast.success('Video updated successfully');
            setIsVideoUpdateOpen(false);
        } catch (error) {
            toast.error(error || 'Failed to update video');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = course.videos.findIndex((video) => video._id === active.id);
        const newIndex = course.videos.findIndex((video) => video._id === over.id);

        const newVideos = arrayMove(course.videos, oldIndex, newIndex);

        // Update local state immediately
        setCourse({
            ...course,
            videos: newVideos
        });

        setIsUpdatingOrder(true);
        try {
            await dispatch(updateVideoOrder({
                courseId,
                videos: newVideos
            })).unwrap();

            toast.success('Video order updated successfully');
        } catch (error) {
            toast.error(error || 'Failed to update video order');
            // Revert the local state if the backend update fails
            setCourse(courses.find(c => c._id === courseId));
        } finally {
            setIsUpdatingOrder(false);
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

    if (!course) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl">Loading course content...</p>
        </div>;
    }

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
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">{course?.title}</h1>
                </div>
                <Button onClick={() => setIsVideoUploadOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={course?.videos.map(video => video._id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${isUpdatingOrder ? 'opacity-50 pointer-events-none' : ''}`}>
                        {course?.videos.map((video) => (
                            <SortableVideoCard
                                key={video._id}
                                video={video}
                                onUpdateClick={handleUpdateClick}
                                onVideoClick={handleVideoClick}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Dialog open={isVideoUploadOpen} onOpenChange={setIsVideoUploadOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Video to Course</DialogTitle>
                        <DialogDescription>
                            Upload a new video for {course.title}
                        </DialogDescription>
                    </DialogHeader>
                    <VideoUpload onVideoUpload={handleVideoUpload} />
                </DialogContent>
            </Dialog>

            <Dialog open={isVideoUpdateOpen} onOpenChange={setIsVideoUpdateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Video</DialogTitle>
                        <DialogDescription>
                            Update video details for {selectedVideo?.title}
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
                        <div className="space-y-2">
                            <Label htmlFor="video">New Video File (Optional)</Label>
                            <Input
                                id="video"
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to keep the current video
                            </p>
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

export default CourseManagement;

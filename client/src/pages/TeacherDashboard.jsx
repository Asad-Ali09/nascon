import { useState, memo, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    BarChart3,
    BookOpen,
    Calendar,
    FileVideo,
    GraduationCap,
    Home,
    MessageSquare,
    Plus,
    Settings,
    Users,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { checkAuthStatus, logoutUser } from "@/Redux/slices/authSlice"
import { createCourse, fetchCourses, addVideoToCourse } from "@/Redux/slices/courseSlice"
import VideoUpload from "@/components/VideoUpload"

const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [option, setOption] = useState("overview");
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
    const [courseFormData, setCourseFormData] = useState({
        title: "",
        description: "",
        thumbnail: "",
        thumbnailFile: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading: authLoading } = useSelector((state) => state.auth);
    const { courses, loading: coursesLoading } = useSelector((state) => state.course);

    // Check authentication and role
    useEffect(() => {
        if (!user) {

            try {
                const resultAction = dispatch(checkAuthStatus());

                // Check if the action type is the fulfilled type
                if (resultAction.type === checkAuthStatus.fulfilled.type) {
                    // Authentication successful, user should be in the store now
                } else {

                    // Authentication failed
                    // navigate("/login");
                }
            } catch (error) {
                console.error("Auth verification error:", error);
                navigate("/login");
            }
        }
    }, [user, authLoading, navigate, dispatch]);

    // Fetch courses when component mounts
    useEffect(() => {
        if (user && user.role === "tutor") {
            dispatch(fetchCourses());
        }
    }, [dispatch, user]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate("/login");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate required fields
        if (!courseFormData.title || !courseFormData.description || !courseFormData.thumbnailFile) {
            toast.error("All fields are required, including the thumbnail image");
            setIsSubmitting(false);
            return;
        }

        try {
            await dispatch(createCourse({
                title: courseFormData.title,
                description: courseFormData.description,
                thumbnailFile: courseFormData.thumbnailFile
            })).unwrap();

            toast.success("Course created successfully!");
            setIsCreateCourseOpen(false);
            setCourseFormData({
                title: "",
                description: "",
                thumbnail: "",
                thumbnailFile: null
            });
        } catch (error) {
            toast.error(error || "Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };
    ;



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleImageUpload = (base64Image, file) => {
        setCourseFormData(prev => ({
            ...prev,
            thumbnail: base64Image,
            thumbnailFile: file
        }));
    };



    if (authLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user || user.role !== "tutor") {
        return null; // Will redirect in useEffect
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background w-[100vw] gap-0 p-0 m-0">
                <TeacherSidebar isOpen={sidebarOpen} setOption={setOption} />
                <SidebarInset className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 flex min-h-[7vh] items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger onClick={() => setSidebarOpen(prev => !prev)} />
                        <div className="flex flex-1 items-center justify-between">
                            <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='hover:cursor-pointer'>
                                        <Avatar>
                                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user?.name || "User"} />
                                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" forceMount>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className='hover:cursor-pointer'>Profile</DropdownMenuItem>
                                        <DropdownMenuItem className='hover:cursor-pointer'>Billing</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className='hover:cursor-pointer' onClick={handleLogout}>Logout</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <main className={`${option === 'chat' ? `flex-1 p-0` : `flex-1 p-6`}`}>
                        {option === "overview" && (
                            <DashboardOverview />
                        )}
                        {option === "courses" && (
                            <CourseManagement
                                courses={courses}
                                loading={coursesLoading}
                                isCreateCourseOpen={isCreateCourseOpen}
                                setIsCreateCourseOpen={setIsCreateCourseOpen}
                                courseFormData={courseFormData}
                                setCourseFormData={setCourseFormData}
                                handleCreateCourse={handleCreateCourse}
                                handleInputChange={handleInputChange}
                                handleImageUpload={handleImageUpload}
                                isSubmitting={isSubmitting}
                            />
                        )}

                        {option === "videos" && (
                            <VideoManagement />
                        )}

                        {option === "students" && (
                            <StudentManagement />
                        )}

                        {option === "chat" && (
                            <ChatInterface />
                        )}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

const TeacherSidebar = memo(({ isOpen, setOption }) => {
    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="border-b">
                <div className={`flex items-center gap-2 py-2 transition-all duration-300 ease-in-out ${isOpen ? 'px-4' : 'px-0'
                    }`}>
                    <div className={`flex h-8 w-8 items-center justify-center ${isOpen ? 'rounded-md' : 'rounded-full'} bg-primary`}>
                        <GraduationCap className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {isOpen === true && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">EduPlatform</span>
                            <span className="text-xs text-muted-foreground">Teacher Portal</span>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Dashboard" onClick={() => setOption("overview")}>
                                    <Home className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Courses" onClick={() => setOption("courses")}>
                                    <BookOpen className="h-4 w-4" />
                                    <span>Courses</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Videos" onClick={() => setOption("videos")}>
                                    <FileVideo className="h-4 w-4" />
                                    <span>Videos</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Community</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Students" onClick={() => setOption("students")}>
                                    <Users className="h-4 w-4" />
                                    <span>Students</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Chat" onClick={() => setOption("chat")}>
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Chat</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
})

const DashboardOverview = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Students"
                    value="1,248"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Active Courses"
                    value="8"
                    icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                />
                <StatsCard
                    title="Video Content"
                    value="64 hrs"
                    icon={<FileVideo className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                        <CardDescription>Students who enrolled in your courses in the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Avatar className={'w-10 h-10'}>
                                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
                                        <AvatarFallback>S{i}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">Student {i}</p>
                                            <Badge variant="outline">New</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Enrolled in Advanced Physics</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">
                            View All Enrollments
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Performance</CardTitle>
                        <CardDescription>Engagement metrics for your top courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Advanced Physics", completion: 87, students: 342 },
                                { name: "Introduction to Chemistry", completion: 76, students: 218 },
                                { name: "Mathematics 101", completion: 92, students: 156 },
                                { name: "Biology Fundamentals", completion: 64, students: 124 },
                                { name: "Biology Mediations", completion: 64, students: 124 },
                                { name: "Biology Validations", completion: 64, students: 124 },
                            ].map((course, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{course.name}</p>
                                        <span className="text-sm text-muted-foreground">{course.students} students</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={course.completion} className="h-2" />
                                        <span className="text-sm font-medium">{course.completion}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">
                            View Detailed Analytics
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </motion.div>
    )
}

const StatsCard = ({ title, value, description, icon }) => {
    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {icon}
            </div>
            <div className="mt-2">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    )
}

const CourseManagement = ({
    courses,
    loading,
    isCreateCourseOpen,
    setIsCreateCourseOpen,
    courseFormData,
    setCourseFormData,
    handleCreateCourse,
    handleInputChange,
    handleImageUpload,
    isSubmitting
}) => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleVideoUpload = async (videoData) => {
        if (!selectedCourse) return;

        try {
            await dispatch(addVideoToCourse({
                courseId: selectedCourse._id,
                videoData
            })).unwrap();
            toast.success('Video added to course successfully');
            setIsVideoUploadOpen(false);
        } catch (error) {
            toast.error(error || 'Failed to add video to course');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Courses</h2>
                <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                    <DialogTrigger asChild>
                        <Button className='cursor-pointer' variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to create a new course.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-4" onSubmit={handleCreateCourse}>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground" htmlFor="title">
                                    Course Title
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={courseFormData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Introduction to Web Development"
                                    className="w-full rounded-lg border border-muted bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground">
                                    Thumbnail Image
                                </label>
                                <DropImage onImageUpload={handleImageUpload} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-foreground" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={courseFormData.description}
                                    onChange={handleInputChange}
                                    placeholder="Write a short description of your course..."
                                    className="w-full rounded-lg border border-muted bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" className="mt-2" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Course"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <p>Loading courses...</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses && courses.length > 0 ? (
                        courses.map((course) => (
                            <motion.div key={course._id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <img src={course.thumbnail} alt="Course Thumbnail" className="h-32 w-full mb-4 rounded-t-lg object-cover" />
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{course.title}</CardTitle>
                                            <Badge variant="default">
                                                Active
                                            </Badge>
                                        </div>
                                        <CardDescription>{course.enrollments?.length || 0} students enrolled</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <FileVideo className="mr-1 h-4 w-4 text-muted-foreground" />
                                                <span>{course.videos?.length || 0} videos</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                                <span>{course.enrollments?.length || 0} students</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button variant="outline" className="flex-1">
                                            Edit
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={() => navigate(`/course/${course._id}`)}
                                        >
                                            Manage Course
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <p className="text-muted-foreground">You haven't created any courses yet.</p>
                        </div>
                    )}

                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                        <Card
                            className="flex h-full flex-col items-center justify-center border-dashed p-6 cursor-pointer"
                            onClick={() => setIsCreateCourseOpen(true)}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium">Create New Course</h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Add a new course to your teaching portfolio
                            </p>
                            <Button className="mt-4" variant="outline">
                                Get Started
                            </Button>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Video Upload Dialog */}
            <Dialog open={isVideoUploadOpen} onOpenChange={setIsVideoUploadOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Video to Course</DialogTitle>
                        <DialogDescription>
                            Upload a video for {selectedCourse?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <VideoUpload onVideoUpload={handleVideoUpload} />
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}

const DropImage = ({ onImageUpload }) => {
    const [image, setImage] = useState(null)
    const [imageUploaded, setImageUploaded] = useState(false)
    const fileInputRef = useRef(null)
    const [file, setFile] = useState(null);
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        setFile(file); // Store the file object

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            setImage(base64data);
            onImageUpload(base64data, file);
        };
        reader.readAsDataURL(file);
        setImageUploaded(true);
    };
    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (!file || !file.type.startsWith("image/")) {
            toast.error("File type not supported", {
                action: {
                    label: "Close",
                    onClick: () => toast.dismiss()
                }
            })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64data = reader.result
            setImage(base64data)
            onImageUpload(base64data)
        }
        reader.readAsDataURL(file)
        setImageUploaded(true)
    }

    const handleDragOver = (e) => e.preventDefault()

    const handleDivClick = () => fileInputRef.current.click()

    const removeImage = () => {
        setImage(null)
        setImageUploaded(false)
    }

    useEffect(() => {
        removeImage()
    }, [])

    return (
        <div
            onClick={handleDivClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative mt-1.5 flex h-36 w-full cursor-pointer border-dashed items-center justify-center rounded-lg border border-black/36 bg-muted/20 px-4 py-2 text-muted-foreground transition hover:bg-muted/30"
        >
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />

            {imageUploaded ? (
                <img src={image} alt="Preview" className="max-h-full object-contain" />
            ) : (
                <span className="text-sm">Drag & drop or click to upload image</span>
            )}
        </div>
    )
}

const VideoManagement = () => {
    const videos = [
        {
            id: 1,
            title: "Introduction to Quantum Mechanics",
            duration: "42:18",
            course: "Advanced Physics",
            status: "transcribed",
        },
        { id: 2, title: "Wave-Particle Duality", duration: "38:45", course: "Advanced Physics", status: "transcribed" },
        { id: 3, title: "Atomic Structure", duration: "45:12", course: "Introduction to Chemistry", status: "transcribed" },
        { id: 4, title: "Chemical Bonding", duration: "36:29", course: "Introduction to Chemistry", status: "processing" },
        { id: 5, title: "Calculus Fundamentals", duration: "52:07", course: "Mathematics 101", status: "transcribed" },
        {
            id: 6,
            title: "Cell Structure and Function",
            duration: "48:33",
            course: "Biology Fundamentals",
            status: "processing",
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Video Content</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload New Video
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Videos</CardTitle>
                    <CardDescription>Manage your video content and AI-generated transcripts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {videos.map((video) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FileVideo className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{video.title}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{video.duration}</span>
                                            <span>•</span>
                                            <span>{video.course}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={video.status === "transcribed" ? "default" : "secondary"}>
                                        {video.status === "transcribed" ? "Transcribed" : "Processing"}
                                    </Badge>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">
                        Load More Videos
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Transcription</CardTitle>
                    <CardDescription>Automatic transcription status for your videos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Transcription Overview</h3>
                                <Badge variant="outline">4/6 Complete</Badge>
                            </div>
                            <Progress value={66.67} className="mt-2 h-2" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                4 videos have been successfully transcribed. 2 videos are still being processed.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <h3 className="font-medium">Completed</h3>
                                </div>
                                <p className="mt-2 text-2xl font-bold">4</p>
                                <p className="text-sm text-muted-foreground">Videos with transcripts</p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                    <h3 className="font-medium">In Progress</h3>
                                </div>
                                <p className="mt-2 text-2xl font-bold">2</p>
                                <p className="text-sm text-muted-foreground">Videos being processed</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const StudentManagement = () => {
    const students = [
        {
            id: 1,
            name: "Alex Johnson",
            email: "alex.j@example.com",
            courses: ["Advanced Physics", "Mathematics 101"],
            progress: 78,
        },
        { id: 2, name: "Samantha Lee", email: "sam.lee@example.com", courses: ["Introduction to Chemistry"], progress: 92 },
        {
            id: 3,
            name: "Michael Chen",
            email: "m.chen@example.com",
            courses: ["Advanced Physics", "Biology Fundamentals"],
            progress: 65,
        },
        { id: 4, name: "Jessica Taylor", email: "j.taylor@example.com", courses: ["Mathematics 101"], progress: 88 },
        {
            id: 5,
            name: "David Wilson",
            email: "d.wilson@example.com",
            courses: ["Introduction to Chemistry", "Biology Fundamentals"],
            progress: 72,
        },
        { id: 6, name: "Emily Rodriguez", email: "e.rodriguez@example.com", courses: ["Advanced Physics"], progress: 81 },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Student Management</h2>
                <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Export Student Data
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>Students currently enrolled in your courses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {students.map((student) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${student.name.charAt(0)}`} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:block">
                                        <div className="flex flex-wrap gap-1">
                                            {student.courses.map((course, i) => (
                                                <Badge key={i} variant="outline">
                                                    {course}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={student.progress} className="h-2 w-20" />
                                        <span className="text-sm font-medium">{student.progress}%</span>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">
                        View All Students
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

const ChatInterface = () => {
    const [selectedChat, setSelectedChat] = useState("course-1")
    const [message, setMessage] = useState("")

    const chats = [
        { id: "course-1", name: "Advanced Physics", unread: 3 },
        { id: "course-2", name: "Introduction to Chemistry", unread: 0 },
        { id: "course-3", name: "Mathematics 101", unread: 1 },
        { id: "course-4", name: "Biology Fundamentals", unread: 0 },
    ]

    const messages = {
        "course-1": [
            {
                id: 1,
                sender: "Alex Johnson",
                content: "Professor, I have a question about the quantum mechanics lecture",
                time: "10:24 AM",
                isTeacher: false,
            },
            {
                id: 2,
                sender: "You",
                content: "Of course, Alex. What specifically are you struggling with?",
                time: "10:26 AM",
                isTeacher: true,
            },
            {
                id: 3,
                sender: "Alex Johnson",
                content: "I'm having trouble understanding the Heisenberg Uncertainty Principle",
                time: "10:28 AM",
                isTeacher: false,
            },
            {
                id: 4,
                sender: "You",
                content:
                    "The Uncertainty Principle states that we cannot simultaneously know both the position and momentum of a particle with perfect precision. The more precisely we know one, the less precisely we can know the other.",
                time: "10:30 AM",
                isTeacher: true,
            },
            {
                id: 5,
                sender: "Alex Johnson",
                content: "That makes more sense now. Could you recommend any additional resources?",
                time: "10:32 AM",
                isTeacher: false,
            },
            {
                id: 6,
                sender: "Samantha Lee",
                content: "I'm also interested in this topic!",
                time: "10:33 AM",
                isTeacher: false,
            },
        ],
        "course-2": [
            {
                id: 1,
                sender: "David Wilson",
                content: "Hello Professor, when will the next lecture be uploaded?",
                time: "9:15 AM",
                isTeacher: false,
            },
            {
                id: 2,
                sender: "You",
                content: "Hi David, I'll be uploading the lecture on Chemical Bonding tomorrow morning.",
                time: "9:20 AM",
                isTeacher: true,
            },
        ],
        "course-3": [
            {
                id: 1,
                sender: "Jessica Taylor",
                content: "Professor, could you explain the calculus problem from yesterday's lecture again?",
                time: "2:45 PM",
                isTeacher: false,
            },
            {
                id: 2,
                sender: "You",
                content: "Sure Jessica. Let me create a quick video explanation and share it here.",
                time: "3:00 PM",
                isTeacher: true,
            },
        ],
        "course-4": [
            {
                id: 1,
                sender: "Michael Chen",
                content: "Is there a study group for the upcoming exam?",
                time: "11:30 AM",
                isTeacher: false,
            },
            {
                id: 2,
                sender: "You",
                content:
                    "Yes, I'll be hosting a review session this Friday at 3 PM. I'll send out the details to everyone enrolled in the course.",
                time: "11:45 AM",
                isTeacher: true,
            },
        ],
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!message.trim()) return

        // In a real app, you would send this to your backend
        setMessage("")
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-[calc(100vh-4.21rem)] overflow-hidden rounded-none border"
        >
            <div className="w-64 border-r">
                <div className="p-4">
                    <h2 className="font-semibold">Course Chat Rooms</h2>
                    <p className="text-sm text-muted-foreground">Connect with your students</p>
                </div>
                <div className="space-y-1 p-2">
                    {chats.map((chat) => (
                        <Button
                            key={chat.id}
                            variant={selectedChat === chat.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedChat(chat.id)}
                        >
                            <div className="flex w-full items-center justify-between">
                                <span>{chat.name}</span>
                                {chat.unread > 0 && <Badge className="ml-auto">{chat.unread}</Badge>}
                            </div>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="border-b p-4">
                    <h2 className="font-semibold">{chats.find((c) => c.id === selectedChat)?.name} Chat Room</h2>
                    <p className="text-sm text-muted-foreground">{messages[selectedChat]?.length || 0} messages</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {messages[selectedChat]?.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-4 flex ${msg.isTeacher ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.isTeacher ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{msg.sender}</span>
                                    <span className="text-xs opacity-70">{msg.time}</span>
                                </div>
                                <p className="mt-1">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <Button type="submit">Send</Button>
                    </form>
                </div>
            </div>
        </motion.div>
    )
}

export default TeacherDashboard

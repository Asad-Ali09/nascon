// client/src/pages/AdminDashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    KeyRound,
    Shield,
    Settings,
    LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminDashboard = () => {
    const user = useSelector((state) => state.auth.user);

    // Uncomment for production
    // if (!user || !user.isAdmin) {
    //   return <Navigate to="/login" replace />;
    // }

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{user?.name?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Dashboard Content */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* Stats Cards */}
                    <motion.div variants={item}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription>Total Users</CardDescription>
                                <CardTitle className="text-4xl">1,234</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    +12% from last month
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription>Active Sessions</CardDescription>
                                <CardTitle className="text-4xl">56</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    +3% from last hour
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardDescription>System Health</CardDescription>
                                <CardTitle className="text-4xl text-green-600">100%</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    All systems operational
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Action Cards */}
                    <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Administration</CardTitle>
                                <CardDescription>
                                    Manage your application settings and users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Users className="w-8 h-8 text-blue-600" />
                                        <span>Manage Users</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <KeyRound className="w-8 h-8 text-purple-600" />
                                        <span>Manage Roles</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Shield className="w-8 h-8 text-green-600" />
                                        <span>Manage Permissions</span>
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={item} className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: item * 0.1 }}
                                            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <Avatar className="h-9 w-9 mr-3">
                                                <AvatarFallback>U{item}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">User {item} updated their profile</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item * 5} minutes ago
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Settings */}
                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Settings className="w-4 h-4 mr-2" />
                                        System Settings
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Users className="w-4 h-4 mr-2" />
                                        User Preferences
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Security
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
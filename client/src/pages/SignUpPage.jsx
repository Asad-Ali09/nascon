import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

import { FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { signUpUser } from '@/Redux/slices/authSlice';
import { signUpFormSchema } from '@/zod/index';

const SignUpForm = ({ type }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const form = useForm({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            username: '', // Add username default value
        },
    });


    const onSubmit = async (data) => {
        try {
            await dispatch(signUpUser({ ...data, userType: type })).unwrap();
            toast.success('Account created!');
            if (type === 'student') {
                // INFO: navigte to student login AFTERT TYHIS 
                navigate('/home');
            } else if (type === 'tutor') {
                navigate('/admin');
            }
            navigate('/');
        } catch (error) {
            toast.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input placeholder="name@example.com" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUserPlus className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input placeholder="Enter your username" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input type="password" placeholder="Password" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input type="password" placeholder="Confirm password" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </motion.div>
            </form>
        </Form>
    );
};

const SignUpPage = () => {
    const [userType, setUserType] = useState('student');

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa] dark:bg-gray-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl rounded-xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                    <CardHeader className="pt-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FiUserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl font-bold">Create a {userType} Account</CardTitle>
                        <CardDescription className="text-center">Enter your details to get started</CardDescription>
                        <div className="flex justify-center gap-2 mt-4">
                            <Button variant={userType === 'student' ? 'default' : 'outline'} onClick={() => setUserType('student')}>Student</Button>
                            <Button variant={userType === 'teacher' ? 'default' : 'outline'} onClick={() => setUserType('teacher')}>Teacher</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <SignUpForm type={userType} />
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SignUpPage;

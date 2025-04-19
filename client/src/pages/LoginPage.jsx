import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginFormSchema } from '@/zod';
import { loginUser, setVerificationEmail } from '@/Redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const form = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const result = await dispatch(loginUser(data)).unwrap();
            dispatch(setVerificationEmail(data.email));
            navigate('/verify');
        } catch (error) {
            toast.error(error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa] dark:bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        <CardHeader className="space-y-1 pt-6">
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <FiLogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <FiMail className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            placeholder="name@example.com"
                                                            {...field}
                                                            className="pl-10 h-11 bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center">
                                                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Password
                                                    </FormLabel>
                                                    <Link
                                                        to="/forgot-password"
                                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <FiLock className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            className="pl-10 h-11 bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-sm text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="pt-2"
                                    >
                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                                    Signing in...
                                                </div>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </motion.div>

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Don't have an account?{' '}
                                            <Link
                                                to="/register"
                                                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Create one
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            By signing in, you agree to our{' '}
                            <Link to="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verificationFormSchema } from '@/zod';
import { verifyCode } from '@/Redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const VerifyPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const verificationEmail = useSelector((state) => state.auth.verificationEmail);
    const { loading } = useSelector((state) => state.auth);

    const form = useForm({
        resolver: zodResolver(verificationFormSchema),
        defaultValues: {
            code: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            await dispatch(verifyCode({ email: verificationEmail, code: data.code })).unwrap();
            navigate('/home');
        } catch (error) {
            toast.error(error || 'Verification failed');
        }
    };

    if (!verificationEmail) {
        navigate('/login');
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        Enter the verification code sent to {verificationEmail}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter 6-digit code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyPage;
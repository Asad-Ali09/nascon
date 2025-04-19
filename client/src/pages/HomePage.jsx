import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/Redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
            <Card className="w-full max-w-lg shadow-xl rounded-lg bg-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-800">
                        Welcome, {user?.name || 'User'}!
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        You have successfully logged in
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
                    >
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default HomePage;
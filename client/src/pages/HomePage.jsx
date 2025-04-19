import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { logoutUser, checkAuthStatus } from '@/Redux/slices/authSlice';

const HomePage = () => {
    const { user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    useEffect(() => {
        const verifyAuth = async () => {
            if (!user && !isVerifying) {
                setIsVerifying(true);
                try {
                    const resultAction = await dispatch(checkAuthStatus());

                    // Check if the action type is the fulfilled type
                    if (resultAction.type === checkAuthStatus.fulfilled.type) {
                        // Authentication successful, user should be in the store now
                    } else {
                        // Authentication failed
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

    // Show loading state while checking auth or when Redux loading state is true
    if (loading || isVerifying) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl">Loading...</p>
        </div>;
    }

    // If after verification we still don't have a user, show not authenticated
    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl">Not authenticated. Redirecting...</p>
        </div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
            <Card className="w-full max-w-lg shadow-xl rounded-lg bg-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-800">
                        Welcome {user.name}
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

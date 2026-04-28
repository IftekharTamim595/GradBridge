import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';

const GoogleLoginButton = ({ loginType = 'student', label }) => {
    const navigate = useNavigate();
    const { googleLogin } = useAuth();
    const { showModal } = useModal();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    const loginToGoogle = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            console.log('Google Login Success (Code Received):', codeResponse);
            try {
                // Pass login_type to backend
                const result = await googleLogin(codeResponse.code, loginType);
                console.log('Backend Google Login Result:', result);

                if (result.success) {
                    const role = result.user?.role || 'student';
                    if (role === 'alumni') navigate('/alumni/dashboard');
                    else navigate('/student/dashboard');
                } else {
                    console.error('Backend Login Failed:', result.error);
                    // Show error in modal instead of alert
                    showModal({
                        type: 'error',
                        message: result.error || 'Google Login Failed'
                    });
                }

            } catch (err) {
                console.error('Google Login Component Catch Error:', err);
                showModal({
                    type: 'error',
                    message: 'Google Login Failed. Please try again.'
                });
            } finally {
                setIsLoggingIn(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Flow Error:', errorResponse);
            showModal({
                type: 'error',
                message: 'Google Login Failed: Popup closed or blocked.'
            });
            setIsLoggingIn(false);
        },
    });

    const handleClick = () => {
        if (isLoggingIn) return;
        setIsLoggingIn(true);
        console.log(`Opening Google Login Popup for ${loginType}...`);
        loginToGoogle();
    };

    const buttonLabel = label || (loginType === 'alumni' ? 'Continue with Google (Alumni)' : 'Continue with Google (Student)');

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isLoggingIn}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <img
                className="w-5 h-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
            />
            <span>{isLoggingIn ? 'Connecting...' : buttonLabel}</span>
        </button>
    );
};

export default GoogleLoginButton;

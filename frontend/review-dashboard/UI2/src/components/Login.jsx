import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Alert, Link, InputAdornment, IconButton,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from './AnimatedBackground';

const Login = ({ onToggle }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedBackground>
            <Box sx={{ width: '100%', maxWidth: '440px', px: 2 }}>
                {/* Logo / Brand */}
                <Box textAlign="center" mb={5}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '20px',
                        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        mb: 2.5,
                        boxShadow: '0 12px 30px rgba(26,115,232,0.3), inset 0 0 15px rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Typography sx={{ color: '#fff', fontWeight: '900', fontSize: '28px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>D</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#fff', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        DIPALI ASSOCIATES & CO
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, fontWeight: 500 }}>
                        Premium Slip & Invoice Portal
                    </Typography>
                </Box>

                {/* Card */}
                <Paper elevation={0} sx={{
                    p: { xs: 4, sm: 5 },
                    borderRadius: '32px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 0 40px rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                    }
                }}>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#fff', mb: 1, letterSpacing: '-0.5px' }}>Welcome Back</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, fontWeight: 500 }}>Sign in to your secure workspace</Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', bgcolor: 'rgba(211, 47, 47, 0.15)', color: '#ff8a80', border: '1px solid rgba(211, 47, 47, 0.2)' }}>{error}</Alert>}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <TextField
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            autoComplete="new-password"
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '18px',
                                    color: '#fff',
                                    transition: 'all 0.3s ease',
                                    '& input': {
                                        '&:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 1000px rgba(13, 27, 78, 0.2) inset !important',
                                            WebkitTextFillColor: '#fff !important',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                            borderRadius: 'inherit',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderWidth: '1px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4285f4',
                                        borderWidth: '2px',
                                        boxShadow: '0 0 20px rgba(66,133,244,0.15)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 500,
                                    '&.Mui-focused': { color: '#4285f4' }
                                }
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required type="email"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: '#4285f4', mr: 1, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Password"
                            variant="outlined"
                            fullWidth
                            autoComplete="new-password"
                            sx={{
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '18px',
                                    color: '#fff',
                                    transition: 'all 0.3s ease',
                                    '& input': {
                                        '&:-webkit-autofill': {
                                            WebkitBoxShadow: '0 0 0 1000px rgba(13, 27, 78, 0.2) inset !important',
                                            WebkitTextFillColor: '#fff !important',
                                            transition: 'background-color 5000s ease-in-out 0s',
                                            borderRadius: 'inherit',
                                        },
                                    },
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderWidth: '1px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#4285f4',
                                        borderWidth: '2px',
                                        boxShadow: '0 0 20px rgba(66,133,244,0.15)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 500,
                                    '&.Mui-focused': { color: '#4285f4' }
                                }
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required type={showPass ? 'text' : 'password'}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#4285f4', mr: 1, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)', mr: 0.5 }}>
                                            {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            startIcon={<LoginIcon />}
                            sx={{
                                py: 2, borderRadius: '16px', fontWeight: '900', fontSize: '16px',
                                background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
                                boxShadow: '0 12px 30px rgba(26,115,232,0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 35px rgba(26,115,232,0.5)' }
                            }}
                        >
                            {loading ? 'Verifying...' : 'Sign In Now'}
                        </Button>
                    </form>

                    <Box textAlign="center" mt={4}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                            New to the portal?{' '}
                            <Link component="button" onClick={onToggle} sx={{ color: '#4285f4', fontWeight: '800', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Create Account
                            </Link>
                        </Typography>
                    </Box>
                </Paper>

                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.5px' }}>
                    © 2026 DIPALI ASSOCIATES & CO. ALL RIGHTS RESERVED.
                </Typography>
            </Box>
        </AnimatedBackground>
    );
};

export default Login;

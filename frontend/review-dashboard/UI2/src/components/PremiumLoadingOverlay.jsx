import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, keyframes } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const config = {
    upload: {
        icon: <AutoFixHighIcon sx={{ fontSize: 40, color: '#fff' }} />,
        title: "Processing...",
        color: "#38bdf8",
        messages: [
            "Analyzing Invoice Structure...",
            "Extracting Vendor Information...",
            "Recognizing Line Items...",
            "Calculating Tax Totals...",
            "Verifying Mathematical Accuracy...",
            "Applying AI Reasoning...",
            "Finalizing Extraction..."
        ]
    },
    save: {
        icon: <CloudDoneIcon sx={{ fontSize: 40, color: '#fff' }} />,
        title: "Saving...",
        color: "#10b981", // Emerald green
        messages: [
            "Securing Connection...",
            "Encrypting Data Assets...",
            "Updating Database Records...",
            "Syncing with Cloud Storage...",
            "Verifying Data Integrity...",
            "Finalizing Save Operation..."
        ]
    }
};

const PremiumLoadingOverlay = ({ isProcessing, mode = 'upload' }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const currentConfig = config[mode] || config.upload;

    useEffect(() => {
        let interval;
        if (isProcessing) {
            setMessageIndex(0);
            interval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % currentConfig.messages.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isProcessing, currentConfig.messages.length]);

    if (!isProcessing) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.4s ease-in-out',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 6,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: 400,
                    width: '90%',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        mb: 4,
                    }}
                >
                    <CircularProgress
                        size={100}
                        thickness={2}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                    <CircularProgress
                        size={100}
                        thickness={2}
                        variant="indeterminate"
                        sx={{
                            color: currentConfig.color,
                            position: 'absolute',
                            left: 0,
                            strokeLinecap: 'round',
                        }}
                    />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: `${pulse} 2s infinite ease-in-out`,
                        }}
                    >
                        {currentConfig.icon}
                    </Box>
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        color: '#fff',
                        fontWeight: 800,
                        mb: 1,
                        letterSpacing: '-0.02em',
                        background: `linear-gradient(to right, #fff, ${currentConfig.color})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {currentConfig.title}
                </Typography>

                <Box sx={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography
                        variant="body1"
                        key={`${mode}-${messageIndex}`}
                        sx={{
                            color: '#94a3b8',
                            fontWeight: 500,
                            animation: 'fadeIn 0.5s ease-in-out',
                        }}
                    >
                        {currentConfig.messages[messageIndex]}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        mt: 4,
                        width: '100%',
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${currentConfig.color}, transparent)`,
                            backgroundSize: '200% 100%',
                            animation: `${shimmer} 1.5s infinite linear`,
                        }}
                    />
                </Box>
            </Box>

            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </Box>
    );
};

export default PremiumLoadingOverlay;

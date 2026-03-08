import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = ({ children }) => {
    return (
        <Box sx={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#0d1b4e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: '800px',
                height: '800px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(26,115,232,0.15) 0%, rgba(26,115,232,0) 70%)',
                filter: 'blur(80px)',
                zIndex: 0,
                animation: 'float 20s infinite alternate ease-in-out',
            },
            '&::before': {
                top: '-10%',
                left: '-10%',
            },
            '&::after': {
                bottom: '-10%',
                right: '-10%',
                animationDelay: '-10s',
                background: 'radial-gradient(circle, rgba(123,31,162,0.12) 0%, rgba(123,31,162,0) 70%)',
            },
            '@keyframes float': {
                '0%': { transform: 'translate(0, 0) scale(1)' },
                '100%': { transform: 'translate(100px, 100px) scale(1.2)' },
            },
            /* Mesh Gradient Overlay */
            '& > .mesh': {
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1,
                opacity: 0.6,
                background: `
                    radial-gradient(at 0% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                    radial-gradient(at 50% 0%, hsla(210,100%,23%,1) 0, transparent 50%),
                    radial-gradient(at 100% 0%, hsla(230,100%,15%,1) 0, transparent 50%),
                    radial-gradient(at 0% 50%, hsla(240,100%,10%,1) 0, transparent 50%),
                    radial-gradient(at 100% 50%, hsla(260,100%,20%,1) 0, transparent 50%),
                    radial-gradient(at 0% 100%, hsla(220,100%,15%,1) 0, transparent 50%),
                    radial-gradient(at 50% 100%, hsla(210,80%,25%,1) 0, transparent 50%),
                    radial-gradient(at 100% 100%, hsla(240,100%,12%,1) 0, transparent 50%)
                `,
            }
        }}>
            <Box className="mesh" />
            <Box sx={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {children}
            </Box>
        </Box>
    );
};

export default AnimatedBackground;

'use client';

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const breakpoints: BreakpointConfig = {
  mobile: 640,
  tablet: 1024,
  desktop: 1025,
};

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setState({
        width,
        isMobile: width <= breakpoints.mobile,
        isTablet: width > breakpoints.mobile && width <= breakpoints.tablet,
        isDesktop: width > breakpoints.tablet,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return state;
}

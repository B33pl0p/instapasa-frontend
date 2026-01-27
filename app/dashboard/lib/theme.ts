import { createTheme, ThemeOptions } from '@mui/material/styles';

export const themeConfig = {
  light: {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
  },
  dark: {
    primary: '#a78bfa', // Lighter purple for dark mode
    secondary: '#f472b6', // Lighter pink for dark mode
    background: '#0a0a0a',
    surface: '#161616',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
  },
};

export const createCustomTheme = (mode: 'light' | 'dark'): ThemeOptions => {
  const colors = themeConfig[mode];

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: mode === 'light' ? '#a78bfa' : '#c4b5fd',
        dark: mode === 'light' ? '#6d28d9' : '#7c3aed',
      },
      secondary: {
        main: colors.secondary,
        light: mode === 'light' ? '#f472b6' : '#fbcfe8',
        dark: mode === 'light' ? '#be185d' : '#ec4899',
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
      },
      divider: mode === 'light' ? '#e5e7eb' : '#374151',
      success: {
        main: mode === 'light' ? '#10b981' : '#34d399',
      },
      warning: {
        main: mode === 'light' ? '#f59e0b' : '#fbbf24',
      },
      error: {
        main: mode === 'light' ? '#ef4444' : '#f87171',
      },
      info: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa',
      },
    },
    typography: {
      fontFamily: '"Geist", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.0078em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${mode === 'light' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.4)'}`,
            },
          },
          outlined: {
            borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '12px',
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 1px 3px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'collapse',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f9fafb' : '#1f2937',
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: mode === 'light' ? '#374151' : '#d1d5db',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#e5e7eb' : '#374151',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '12px',
          },
        },
      },
    },
  };
};

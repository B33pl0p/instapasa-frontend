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
    background: '#121212', // Material Design recommended dark bg (not pure black)
    surface: '#1e1e1e', // Elevated surface
    text: '#e3e3e3', // Softer white (not pure white)
    textSecondary: '#9e9e9e', // Medium gray for less contrast
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
      divider: mode === 'light' ? '#e5e7eb' : '#2d2d2d',
      success: {
        main: mode === 'light' ? '#10b981' : '#4ade80',
      },
      warning: {
        main: mode === 'light' ? '#f59e0b' : '#fbbf24',
      },
      error: {
        main: mode === 'light' ? '#ef4444' : '#fb7185',
      },
      info: {
        main: mode === 'light' ? '#3b82f6' : '#60a5fa',
      },
      action: {
        active: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
        hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
        selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
        disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
        disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
    },
    typography: {
      fontFamily: '"Geist", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 15,
      h1: {
        fontSize: '2.75rem',
        fontWeight: 700,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: 700,
        letterSpacing: '-0.0078em',
      },
      h3: {
        fontSize: '1.9rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.65rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.35rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1.1rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1.05rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.95rem',
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
              : '0 2px 8px rgba(0, 0, 0, 0.6)',
            backgroundColor: mode === 'dark' ? '#1e1e1e' : undefined,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '8px',
            backgroundColor: mode === 'dark' ? '#1e1e1e' : undefined,
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
            backgroundColor: mode === 'light' ? '#f9fafb' : '#242424',
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: mode === 'light' ? '#374151' : '#b0b0b0',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#e5e7eb' : '#2d2d2d',
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

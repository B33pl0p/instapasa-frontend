import { createTheme, ThemeOptions } from '@mui/material/styles';

// Instagram-inspired color palette
export const themeConfig = {
  light: {
    primary: '#0095f6', // Instagram blue
    secondary: '#ed4956', // Instagram red/pink
    background: '#fafafa', // Instagram's light gray background
    surface: '#ffffff',
    text: '#262626', // Instagram's text color
    textSecondary: '#8e8e8e', // Instagram's secondary text
    border: '#dbdbdb', // Instagram's border color
  },
  dark: {
    primary: '#0095f6', // Instagram blue (same in dark)
    secondary: '#ed4956', // Instagram red/pink
    background: '#000000', // Instagram dark mode - pure black
    surface: '#121212', // Slightly elevated surface
    text: '#fafafa', // Light text for dark mode
    textSecondary: '#a8a8a8', // Secondary text for dark mode
    border: '#262626', // Dark mode border
  },
};

export const createCustomTheme = (mode: 'light' | 'dark'): ThemeOptions => {
  const colors = themeConfig[mode];

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: mode === 'light' ? '#4cb5f9' : '#4cb5f9',
        dark: mode === 'light' ? '#0077cc' : '#0077cc',
      },
      secondary: {
        main: colors.secondary,
        light: mode === 'light' ? '#ff6b76' : '#ff6b76',
        dark: mode === 'light' ? '#c13743' : '#c13743',
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
      success: {
        main: mode === 'light' ? '#00c853' : '#00e676',
      },
      warning: {
        main: mode === 'light' ? '#ff9800' : '#ffb74d',
      },
      error: {
        main: mode === 'light' ? '#ed4956' : '#ff6b76',
      },
      info: {
        main: mode === 'light' ? '#0095f6' : '#4cb5f9',
      },
      action: {
        active: mode === 'light' ? 'rgba(38, 38, 38, 0.54)' : 'rgba(250, 250, 250, 0.7)',
        hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
        selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
        disabled: mode === 'light' ? 'rgba(38, 38, 38, 0.3)' : 'rgba(250, 250, 250, 0.3)',
        disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      h1: {
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '14px',
        lineHeight: 1.5,
        letterSpacing: '0em',
      },
      body2: {
        fontSize: '12px',
        lineHeight: 1.4,
        letterSpacing: '0em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '14px',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '7px 16px',
            fontSize: '14px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
            '&:active': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: colors.border,
            '&:hover': {
              borderColor: colors.border,
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: 'none',
            backgroundColor: colors.surface,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: 'none',
            backgroundColor: colors.surface,
          },
          elevation0: {
            border: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: colors.surface,
              '& fieldset': {
                borderColor: colors.border,
              },
              '&:hover fieldset': {
                borderColor: colors.border,
              },
              '&.Mui-focused fieldset': {
                borderWidth: '1px',
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          input: {
            fontSize: '14px',
            '&::placeholder': {
              color: colors.textSecondary,
              opacity: 1,
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              fontSize: '12px',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: colors.surface,
              borderBottom: `1px solid ${colors.border}`,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.04)',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: colors.border,
            fontSize: '14px',
            padding: '12px 16px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            height: '24px',
          },
          outlined: {
            borderColor: colors.border,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
              : '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '18px',
            fontWeight: 600,
            padding: '20px 24px 16px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.16)',
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border,
          },
        },
      },
    },
  };
};

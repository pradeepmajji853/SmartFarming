import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define your custom color palette
const palette = {
  primary: {
    light: '#4caf50',
    main: '#2e7d32', // Rich green for farming association
    dark: '#1b5e20',
    contrastText: '#fff',
  },
  secondary: {
    light: '#9c27b0',
    main: '#6a1b9a', // Purple for innovation and technology
    dark: '#4a148c',
    contrastText: '#fff',
  },
  error: {
    light: '#e57373',
    main: '#f44336',
    dark: '#d32f2f',
    contrastText: '#fff',
  },
  warning: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    light: '#4fc3f7',
    main: '#03a9f4',
    dark: '#0288d1',
    contrastText: '#fff',
  },
  success: {
    light: '#81c784',
    main: '#4caf50',
    dark: '#388e3c',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
};

// Define custom typography
const typography = {
  fontFamily: [
    '"Poppins"',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '2rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  h5: {
    fontWeight: 500,
    fontSize: '1.25rem',
  },
  h6: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  button: {
    fontWeight: 600,
    textTransform: 'none',
  },
};

// Define custom shape
const shape = {
  borderRadius: 8,
};

// Define custom shadows
const shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.03)',
  '0px 3px 3px -2px rgba(0,0,0,0.06),0px 3px 4px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.04)',
  '0px 3px 4px -2px rgba(0,0,0,0.07),0px 4px 5px 0px rgba(0,0,0,0.05),0px 1px 10px 0px rgba(0,0,0,0.05)',
  '0px 2px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.06),0px 1px 14px 0px rgba(0,0,0,0.06)',
  '0px 3px 6px -1px rgba(0,0,0,0.09),0px 6px 10px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.07)',
  '0px 3px 7px -2px rgba(0,0,0,0.1),0px 7px 10px 1px rgba(0,0,0,0.08),0px 2px 16px 1px rgba(0,0,0,0.08)',
  '0px 4px 8px -2px rgba(0,0,0,0.11),0px 8px 11px 1px rgba(0,0,0,0.09),0px 2px 18px 1px rgba(0,0,0,0.09)',
  '0px 5px 9px -2px rgba(0,0,0,0.12),0px 9px 12px 1px rgba(0,0,0,0.1),0px 3px 20px 1px rgba(0,0,0,0.1)',
  '0px 5px 10px -3px rgba(0,0,0,0.13),0px 10px 14px 1px rgba(0,0,0,0.11),0px 3px 22px 2px rgba(0,0,0,0.11)',
  '0px 6px 11px -3px rgba(0,0,0,0.14),0px 11px 15px 1px rgba(0,0,0,0.12),0px 4px 24px 2px rgba(0,0,0,0.12)',
  '0px 6px 12px -3px rgba(0,0,0,0.15),0px 12px 17px 2px rgba(0,0,0,0.13),0px 5px 26px 2px rgba(0,0,0,0.13)',
  '0px 7px 13px -3px rgba(0,0,0,0.16),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 28px 4px rgba(0,0,0,0.14)',
  '0px 7px 14px -4px rgba(0,0,0,0.17),0px 14px 21px 2px rgba(0,0,0,0.15),0px 5px 30px 5px rgba(0,0,0,0.15)',
  '0px 7px 15px -4px rgba(0,0,0,0.18),0px 15px 23px 2px rgba(0,0,0,0.16),0px 6px 32px 5px rgba(0,0,0,0.16)',
  '0px 8px 16px -4px rgba(0,0,0,0.19),0px 16px 24px 2px rgba(0,0,0,0.17),0px 6px 34px 6px rgba(0,0,0,0.17)',
  '0px 8px 17px -4px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.18),0px 6px 38px 7px rgba(0,0,0,0.18)',
  '0px 8px 18px -5px rgba(0,0,0,0.21),0px 18px 28px 2px rgba(0,0,0,0.19),0px 7px 42px 8px rgba(0,0,0,0.19)',
  '0px 9px 19px -5px rgba(0,0,0,0.22),0px 19px 29px 2px rgba(0,0,0,0.2),0px 7px 36px 8px rgba(0,0,0,0.2)',
  '0px 9px 20px -5px rgba(0,0,0,0.23),0px 20px 31px 3px rgba(0,0,0,0.21),0px 8px 38px 9px rgba(0,0,0,0.21)',
  '0px 10px 21px -5px rgba(0,0,0,0.24),0px 21px 33px 3px rgba(0,0,0,0.22),0px 8px 40px 10px rgba(0,0,0,0.22)',
  '0px 10px 22px -6px rgba(0,0,0,0.25),0px 22px 34px 3px rgba(0,0,0,0.23),0px 8px 42px 11px rgba(0,0,0,0.23)',
  '0px 11px 23px -6px rgba(0,0,0,0.26),0px 23px 36px 3px rgba(0,0,0,0.24),0px 9px 44px 10px rgba(0,0,0,0.24)',
  '0px 11px 24px -6px rgba(0,0,0,0.27),0px 24px 38px 3px rgba(0,0,0,0.25),0px 9px 46px 12px rgba(0,0,0,0.25)',
  '0px 11px 25px -7px rgba(0,0,0,0.28),0px 25px 39px 3px rgba(0,0,0,0.26),0px 10px 48px 12px rgba(0,0,0,0.26)',
];

// Define component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 6px 12px 0 rgba(0,0,0,0.12)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        overflow: 'hidden',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 16,
        '&:last-child': {
          paddingBottom: 16,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 16,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        height: 8,
      },
    },
  },
};

// Create theme
let theme = createTheme({
  palette,
  typography,
  shape,
  shadows,
  components,
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;
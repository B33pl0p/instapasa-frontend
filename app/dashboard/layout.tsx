'use client'

import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { usePathname } from 'next/navigation';

import { sidebarItems, type SidebarItem } from './message/(components)/sidebarItems';
import { useRouter } from 'next/navigation';
import RouteGuard from './message/(components)/RouteGuard';
import { useAuth } from '@/app/(site)/lib/auth';
import { useInstagramAuth } from './message/(components)/useInstagramAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/app/dashboard/lib/hooks';
import { useEffect } from 'react';
import { setCustomer, setInitialSyncTriggered } from '@/app/dashboard/lib/slices/customerSlice';
import { getCustomerFromToken } from '@/app/dashboard/lib/utils/jwt';
import { initialSyncConversationsWithMessages } from '@/app/dashboard/lib/slices/instagramMessagesSlice';
import { ToastProvider } from '@/app/dashboard/lib/components/ToastContainer';
import { ThemeProvider, useTheme } from '@/app/dashboard/lib/ThemeProvider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 250;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  border: 'none',
  borderRight: `1px solid ${theme.palette.divider}`,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `72px`,
  border: 'none',
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('sm')]: {
    width: `72px`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 0),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export default function DashboardLayout({
    children,
}:{
    children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeProvider>
  );
}

function DashboardLayoutContent({
    children,
}:{
    children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  const pathname = usePathname();
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const router = useRouter();
  const { logout } = useAuth();
  const { profilePictureUrl } = useInstagramAuth();
  const { mode, toggleTheme } = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  
  const dispatch = useAppDispatch();
  const businessName = useAppSelector((state) => state.customer.business_name);
  const customerLoaded = useAppSelector((state) => state.customer.isLoaded);
  const instagramUsername = useAppSelector((state) => state.customer.instagram_username);
  const initialSyncTriggered = useAppSelector((state) => state.customer.initialSyncTriggered);

  // Load customer data from JWT token
  useEffect(() => {
    if (!customerLoaded) {
      const customerData = getCustomerFromToken();
      if (customerData) {
        dispatch(setCustomer(customerData));
      }
    }
  }, [customerLoaded, dispatch]);

  // Trigger initial sync for Instagram messages on login
  useEffect(() => {
    if (customerLoaded && instagramUsername && !initialSyncTriggered) {
      dispatch(setInitialSyncTriggered());
      // Silently sync in background - no loading state needed
      dispatch(initialSyncConversationsWithMessages());
    }
  }, [customerLoaded, instagramUsername, initialSyncTriggered, dispatch]);

  // Reset image error when profilePictureUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [profilePictureUrl]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <RouteGuard>
      <ToastProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', boxSizing: 'border-box', width: '100%' }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              position: 'relative',
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerHeader>
            <Button
              onClick={handleDrawerToggle}
              sx={{
                width: '100%',
                height: '100%',
                justifyContent: open ? 'flex-start' : 'center',
                textTransform: 'none',
                color: 'text.primary',
                bgcolor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                padding: open ? 2 : 1,
                gap: open ? 1.5 : 0,
                minHeight: 64,
              }}
            >
              {profilePictureUrl && !imageError ? (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Image
                    src={profilePictureUrl}
                    alt="Profile"
                    width={32}
                    height={32}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                </Box>
              ) : (
                <AccountCircleIcon
                  sx={{
                    width: 32,
                    height: 32,
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                />
              )}
              {open && (
                <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    noWrap 
                    sx={{ 
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {businessName || 'Company'}
                  </Typography>
                  {instagramUsername && (
                    <Typography 
                      variant="caption" 
                      noWrap 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                        fontSize: '12px',
                      }}
                    >
                      @{instagramUsername}
                    </Typography>
                  )}
                </Box>
              )}
            </Button>
          </DrawerHeader>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <List sx={{ overflowY: 'auto', height: '100%', py: 1 }}>
            {(['General', 'Messages', 'Services','Prodcuts'] as SidebarItem['section'][]).map(
              (section) => {
                const itemsForSection = sidebarItems.filter(
                  (item) => item.section === section,
                );

                if (!itemsForSection.length) return null;

                return (
                  <Box key={section} sx={{ mb: 2 }}>
                    {open && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          px: 2.5, 
                          py: 1, 
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                        }}
                      >
                        {section}
                      </Typography>
                    )}
                    {itemsForSection.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <ListItem
                          key={item.label}
                          disablePadding
                          sx={{ display: 'block', px: open ? 1 : 0.5 }}
                        >
                          <ListItemButton
                            onClick={() => router.push(item.href)}
                            sx={[
                              {
                                minHeight: 44,
                                borderRadius: open ? 1.5 : 2,
                                px: open ? 2 : 0,
                                mx: open ? 0 : 0.5,
                                bgcolor: isActive ? (theme) => (theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)') : 'transparent',
                                color: 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                                },
                                ...(isActive && {
                                  fontWeight: 600,
                                }),
                              },
                              open
                                ? {
                                    justifyContent: 'flex-start',
                                  }
                                : {
                                    justifyContent: 'center',
                                  },
                            ]}
                          >
                            <ListItemIcon
                              sx={[
                                {
                                  minWidth: 0,
                                  justifyContent: 'center',
                                  color: isActive ? 'text.primary' : 'text.secondary',
                                },
                                open
                                  ? {
                                      mr: 2,
                                    }
                                  : {
                                      mr: 'auto',
                                    },
                              ]}
                            >
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 400,
                              }}
                              sx={[
                                open
                                  ? {
                                      opacity: 1,
                                    }
                                  : {
                                      opacity: 0,
                                    },
                              ]}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </Box>
                );
              },
            )}
            </List>
          </Box>
          
          {/* Theme Toggle Button */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
            <ListItem disablePadding sx={{ display: 'block', px: open ? 1 : 0.5 }}>
              <ListItemButton
                onClick={toggleTheme}
                sx={[
                  {
                    minHeight: 44,
                    borderRadius: open ? 1.5 : 2,
                    px: open ? 2 : 0,
                    mx: open ? 0 : 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  },
                  open
                    ? {
                        justifyContent: 'flex-start',
                      }
                    : {
                        justifyContent: 'center',
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: 'center',
                      color: 'text.secondary',
                    },
                    open
                      ? {
                          mr: 2,
                        }
                      : {
                          mr: 'auto',
                        },
                  ]}
                >
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText
                  primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  primaryTypographyProps={{
                    fontSize: '14px',
                  }}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </ListItem>
          </Box>

          {/* Logout Button at Bottom */}
          <Box
            sx={{
              mt: 'auto',
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 1,
              pb: 1,
            }}
          >
            <ListItem disablePadding sx={{ display: 'block', px: open ? 1 : 0.5 }}>
              <ListItemButton
                onClick={handleLogoutClick}
                sx={[
                  {
                    minHeight: 44,
                    borderRadius: open ? 1.5 : 2,
                    px: open ? 2 : 0,
                    mx: open ? 0 : 0.5,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'rgba(237, 73, 86, 0.08)',
                    },
                  },
                  open
                    ? {
                        justifyContent: 'flex-start',
                      }
                    : {
                        justifyContent: 'center',
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: 'center',
                      color: 'inherit',
                    },
                    open
                      ? {
                          mr: 2,
                        }
                      : {
                          mr: 'auto',
                        },
                  ]}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Log out"
                  primaryTypographyProps={{
                    fontSize: '14px',
                  }}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Drawer>
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            height: '100vh',
            overflow: 'auto',
            minWidth: 0,
            margin: 0,
            padding: 0,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', height: '100%', minWidth: 0, margin: 0, padding: 0 }}>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to login again to access your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      </ToastProvider>
    </RouteGuard>
  );
}

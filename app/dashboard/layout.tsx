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
import { setCustomer } from '@/app/dashboard/lib/slices/customerSlice';
import { getCustomerFromToken } from '@/app/dashboard/lib/utils/jwt';
import { ToastProvider } from '@/app/dashboard/lib/components/ToastContainer';
import { ThemeProvider, useTheme } from '@/app/dashboard/lib/ThemeProvider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
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

  // Load customer data from JWT token
  useEffect(() => {
    if (!customerLoaded) {
      const customerData = getCustomerFromToken();
      if (customerData) {
        dispatch(setCustomer(customerData));
      }
    }
  }, [customerLoaded, dispatch]);

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
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
            },
          }}
        >
          <DrawerHeader>
            <Button
              onClick={handleDrawerToggle}
              sx={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: 'text.primary',
                bgcolor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                padding: 2,
              }}
            >
              {profilePictureUrl && !imageError ? (
                <Image
                  src={profilePictureUrl}
                  alt="Instagram Profile"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <AccountCircleIcon
                  sx={{
                    width: 28,
                    height: 28,
                    color: 'text.secondary',
                  }}
                />
              )}
              {open && (
                <Typography variant="subtitle1" noWrap sx={{ ml: 1 }}>
                  {businessName || 'Company'}
                </Typography>
              )}
            </Button>
          </DrawerHeader>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <List sx={{ overflowY: 'auto', height: '100%' }}>
            {(['General', 'Messages', 'Services','Prodcuts'] as SidebarItem['section'][]).map(
              (section) => {
                const itemsForSection = sidebarItems.filter(
                  (item) => item.section === section,
                );

                if (!itemsForSection.length) return null;

                return (
                  <Box key={section} sx={{ mb: 1 }}>
                    {open && (
                      <Typography
                        variant="caption"
                        sx={{ px: 2.5, py: 1, color: 'text.secondary' }}
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
                          sx={{ display: 'block' }}
                        >
                          <ListItemButton
                            onClick={() => router.push(item.href)}
                            sx={[
                              {
                                minHeight: 48,
                                px: 2.5,
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                color: isActive ? 'primary.contrastText' : 'text.primary',
                                '&:hover': {
                                  bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                  color: isActive ? 'primary.contrastText' : 'text.primary',
                                },
                              },
                              open
                                ? {
                                    justifyContent: 'initial',
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
                                  color: isActive ? 'primary.contrastText' : 'inherit',
                                },
                                open
                                  ? {
                                      mr: 3,
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
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={toggleTheme}
              sx={[
                {
                  minHeight: 48,
                  px: 2.5,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
                open
                  ? {
                      justifyContent: 'initial',
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
                  },
                  open
                    ? {
                        mr: 3,
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

          {/* Logout Button at Bottom */}
          <Box
            sx={{
              mt: 'auto',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={handleLogoutClick}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                    },
                  },
                  open
                    ? {
                        justifyContent: 'initial',
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
                          mr: 3,
                        }
                      : {
                          mr: 'auto',
                        },
                  ]}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
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
            overflow: 'auto'
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', height: '100%' }}>
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

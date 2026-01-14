'use client'

import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import generic from '@/public/generic.png'
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { sidebarItems, type SidebarItem } from './(components)/sidebarItems';
import { useRouter } from 'next/navigation';
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

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
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
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const handleDrawerToggle = () => {
    setOpen(!open);
  };


  const router = useRouter();

  return (    
  
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Button
            onClick={handleDrawerToggle}
            sx={{
              width: '100%',
              height: '100%',
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: 'text.primary',
              bgcolor: '#F3E5F5',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              padding: 2,
            }}
          >
             <Image 
                src={generic} 
                alt="Company Logo" 
                width={28}
                height={28}
                className="rounded-full object-cover"
                />
            {open && (
              <Typography variant="subtitle1" noWrap sx={{ ml: 1 }}>
                Placeholder Company name
              </Typography>
            )}
          </Button>
        </DrawerHeader>

        <List>
          {(['General', 'Messages', 'Services'] as SidebarItem['section'][]).map(
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
                              bgcolor: isActive ? '#dbd9d9' : 'transparent',
                              '&:hover': {
                                bgcolor: isActive ? '#dbd9d9' : 'action.hover',
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
       
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1}}>

        {children}
      </Box>
    </Box>
  
  );
}
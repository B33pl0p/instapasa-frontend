'use client'

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import InstagramIcon from '@mui/icons-material/Instagram';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import MessengerIcon from '@/public/messenger.png'
import Image from 'next/image';

type SidebarSection = 'General' | 'Messages' | 'Services' | 'Prodcuts';

export type SidebarItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  section: SidebarSection;
};

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Integrations',
    icon: <ViewModuleIcon />,
    href: '/dashboard/message',
    section: 'General',
  },
  {
    label: 'Instagram',
    icon: <InstagramIcon />,
    href: '/dashboard/message/instagram',
    section: 'Messages',
  },
  {
    label: 'Messenger',
    icon: <MapsUgcIcon/>,
    href: '/dashboard/message/messenger',
    section: 'Messages',
  },
  {
    label: 'Analytics',
    icon: <SpaceDashboardIcon />,
    href: '/dashboard/message/analytics',
    section: 'Services',
  },
  {
    label:'Products',
    icon: <ShoppingCartIcon />,
    href: '/dashboard/products',
    section: 'Prodcuts',
  },
  {
    label: 'Orders',
    icon: <ReceiptLongIcon />,
    href: '/dashboard/orders',
    section: 'Prodcuts',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    href: '/dashboard/settings',
    section: 'General',
  }
];
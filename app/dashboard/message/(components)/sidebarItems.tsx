'use client'

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import instagramIcon from '@/public/instagramIcon.svg';
import Image from 'next/image';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import messenger from '@/public/messengerIcon.svg';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
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
    icon: <Image src={instagramIcon} alt="instgram" />,
    href: '/dashboard/message/instagram',
    section: 'Messages',
  },
  {
    label: 'Messenger',
    icon: <Image src={messenger} alt="instagram" />,
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
  }
];
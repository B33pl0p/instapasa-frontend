'use client'

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import instagramIcon from '@/public/instagramIcon.svg';
import Image from 'next/image';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import messenger from '@/public/messengerIcon.svg';

type SidebarSection = 'General' | 'Messages' | 'Services';

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
    href: '/message',
    section: 'General',
  },
  {
    label: 'Instagram',
    icon: <Image src={instagramIcon} alt="instgram" />,
    href: '/message/instagram',
    section: 'Messages',
  },
  {
    label: 'Messenger',
    icon: <Image src={messenger} alt="instagram" />,
    href: '/message/messenger',
    section: 'Messages',
  },
  {
    label: 'Analytics',
    icon: <SpaceDashboardIcon />,
    href: '/message/analytics',
    section: 'Services',
  },
];
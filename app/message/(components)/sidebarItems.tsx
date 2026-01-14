import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export  const sidebarItems = [
    {
        label: "Dashboard",
        icon: <SpaceDashboardIcon/>,
        href: '/dashboard'  
    },
    {
        label: "Intents",
        icon:<ViewColumnIcon/>,
        href: '/intents'
    },
    {
        label: "Customer",
        icon: <PeopleAltIcon />,
        href: '/customers-management'
    }
]
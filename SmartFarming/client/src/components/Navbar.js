import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider, 
  useMediaQuery, 
  useTheme, 
  Badge,
  IconButton,
  Tooltip,
  alpha,
  Container,
  ListItemButton,
  Paper,
  Collapse
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon, 
  WbSunny as WeatherIcon,
  Agriculture as CropIcon,
  BugReport as PestIcon,
  TrendingUp as MarketIcon,
  TrendingUp,
  Support as ExpertIcon,
  ShoppingCart as DigitalMarketIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Psychology as AIIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as AnalyticsIcon,
  Storefront as StoreIcon,
  GridView as GridViewIcon,
  ExpandLess as ExpandLessIcon,
  Apps as AppsIcon,
  Circle as CircleIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  MenuOpen as MenuOpenIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

// Define animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: '0.5px',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 4s ease infinite`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
}));

const LogoIcon = styled(CropIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
  animation: `${float} 3s ease-in-out infinite`,
}));

const ActiveIndicator = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 4,
  height: '60%',
  background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
}));

const ProfileAvatar = styled(Avatar)(({ theme, active }) => ({
  width: 40,
  height: 40,
  border: active ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
  boxShadow: active ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const NavItemBox = styled(ListItemButton)(({ theme, active }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.2, 3),
  minHeight: 48,
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.2s ease',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  marginBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.05),
    paddingLeft: theme.spacing(3.5),
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    transform: 'translateY(-2px)',
  },
}));

const DrawerGradientTop = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '150px',
  background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.03)}, transparent)`,
  zIndex: 0,
}));

const MenuPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  minWidth: 180,
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  animation: `${fadeIn} 0.2s ease`,
}));

const ShimmerButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: `linear-gradient(90deg, 
      rgba(255, 255, 255, 0) 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      rgba(255, 255, 255, 0) 100%)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s infinite`,
  }
}));

const SubMenuItemBox = styled(ListItemButton)(({ theme, level = 0 }) => ({
  paddingLeft: theme.spacing(level === 0 ? 3 : 5),
  minHeight: 42,
  fontSize: 14,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  margin: theme.spacing(0.3, 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.8),
    paddingLeft: theme.spacing(level === 0 ? 3.5 : 5.5),
  },
}));

const MenuDot = styled(CircleIcon)(({ theme, color = 'primary' }) => ({
  fontSize: 8,
  color: theme.palette[color].main,
  marginRight: theme.spacing(1),
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, drawerWidth }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

// Sidebar component (formerly Navbar)
const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const drawerWidth = 280;

  // Set sidebar to closed by default on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const handleSubmenuToggle = (id) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };
  
  // Navigation items
  const navItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { id: 'weather', title: 'Weather', path: '/weather', icon: <WeatherIcon /> },
    { id: 'crops', title: 'Crops', path: '/crops', icon: <CropIcon /> },
    { 
      id: 'market', 
      title: 'Market', 
      icon: <MarketIcon />,
      submenu: [
        { title: 'Market Trends', path: '/market-trends', icon: <TrendingUp fontSize="small" /> },
        { title: 'Digital Marketplace', path: '/market-access', icon: <StoreIcon fontSize="small" /> },
        { title: 'My Listings', path: '/market-access/my-listings', icon: <GridViewIcon fontSize="small" /> },
        { title: 'My Offers', path: '/market-access/my-offers', icon: <DigitalMarketIcon fontSize="small" /> },
      ]
    },
    { id: 'expert', title: 'Expert Connect', path: '/experts', icon: <ExpertIcon /> },
    { id: 'ai-advisor', title: 'AI Advisor', path: '/ai-advisor', icon: <AIIcon /> },
  ];
  
  // Drawer content
  const drawer = (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DrawerGradientTop />
      
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <LogoIcon fontSize="large" />
          <LogoText variant="h5">
            Smart Farming
          </LogoText>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <MenuOpenIcon />}
        </IconButton>
      </DrawerHeader>
      
      <Divider />
      
      {user && (
        <Box sx={{ px: 3, my: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 3, 
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`,
          }}>
            <ProfileAvatar 
              alt={user.name}
              src={user?.imageUrl}
              sx={{ width: 50, height: 50, mr: 2 }}
              onClick={handleProfileMenuOpen}
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Notifications">
                <ActionIconButton size="small">
                  <NotificationBadge badgeContent={notificationCount} color="error">
                    <NotificationIcon fontSize="small" />
                  </NotificationBadge>
                </ActionIconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ 
        px: 2, 
        flexGrow: 1,
        overflowY: 'auto', 
        overflowX: 'hidden',
      }}>
        <List component="nav" disablePadding>
          <NavItemBox
            component={Link}
            to="/"
            active={location.pathname === "/" ? 1 : 0}
          >
            {location.pathname === "/" && <ActiveIndicator />}
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: location.pathname === "/" ? theme.palette.primary.main : 'inherit'
            }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Home" 
              primaryTypographyProps={{ 
                fontWeight: location.pathname === "/" ? 600 : 400,
                opacity: open ? 1 : 0,
              }} 
              sx={{ display: open ? 'block' : 'none' }}
            />
          </NavItemBox>

          {navItems.map((item) => {
            const isActive = item.submenu 
              ? item.submenu.some(subItem => location.pathname === subItem.path)
              : location.pathname === item.path;

            if (item.submenu) {
              return (
                <React.Fragment key={item.id || item.title}>
                  <NavItemBox
                    onClick={() => handleSubmenuToggle(item.id)}
                    active={isActive ? 1 : 0}
                  >
                    {isActive && <ActiveIndicator />}
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: isActive ? theme.palette.primary.main : 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 600 : 400,
                      }}
                      sx={{ display: open ? 'block' : 'none' }}
                    />
                    {open && (openSubmenu === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </NavItemBox>
                  
                  {open && (
                    <Collapse in={openSubmenu === item.id} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <SubMenuItemBox
                              key={subItem.path}
                              component={Link}
                              to={subItem.path}
                              level={1}
                              sx={{
                                backgroundColor: isSubActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                color: isSubActive ? theme.palette.primary.main : theme.palette.text.secondary,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MenuDot 
                                  color={isSubActive ? "primary" : "action"}
                                />
                                {subItem.icon}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    ml: 2,
                                    fontWeight: isSubActive ? 600 : 400,
                                  }}
                                >
                                  {subItem.title}
                                </Typography>
                              </Box>
                            </SubMenuItemBox>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            }
            
            return (
              <NavItemBox
                component={Link}
                to={item.path}
                key={item.path}
                active={isActive ? 1 : 0}
              >
                {isActive && <ActiveIndicator />}
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: isActive ? theme.palette.primary.main : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 400,
                  }} 
                  sx={{ display: open ? 'block' : 'none' }}
                />
              </NavItemBox>
            );
          })}
        </List>
      </Box>

      {user && (
        <Box sx={{ p: 2 }}>
          <ShimmerButton
            color="error"
            fullWidth
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.main',
              p: 1,
              minWidth: 0,
              '& .MuiSvgIcon-root': {
                transition: 'transform 0.2s'
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'translateX(3px)'
              }
            }}
          >
            <LogoutIcon />
            {open && (
              <Typography 
                variant="body2" 
                sx={{ ml: 1, color: 'error.main', fontWeight: 600 }}
              >
                Logout
              </Typography>
            )}
          </ShimmerButton>
        </Box>
      )}
      
      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          component: MenuPaper
        }}
        sx={{
          '& .MuiPaper-root': {
            overflow: 'visible',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            '& .MuiMenu-list': {
              padding: '8px 0',
            },
            '& .MuiMenuItem-root': {
              padding: '10px 16px',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(5px)',
              },
            },
          }
        }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={handleProfileMenuClose}
          component={Link}
          to="/profile"
        >
          <ListItemIcon>
            <ProfileIcon fontSize="small" color="primary" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem 
          onClick={handleProfileMenuClose}
          component={Link}
          to="/settings"
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="action" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => isMobile ? theme.shadows[8] : 'none',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          position: 'relative',
          pl: 0,
        }}
      >
        <Box 
          sx={{ 
            position: 'fixed',
            top: 16,
            left: open ? drawerWidth + 16 : 16,
            zIndex: 1200,
            transition: theme => theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <ShimmerButton
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: theme => alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme => theme.shadows[3],
              borderRadius: '50%',
              p: 1.2,
            }}
          >
            <MenuIcon />
          </ShimmerButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
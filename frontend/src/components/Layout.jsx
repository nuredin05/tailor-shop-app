import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Users,
  UserPlus,
  ClipboardList,
  BarChart3,
  LogOut,
  Bell,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  School,
  Menu,
  X,
  ArrowUp,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollableElement = e.target;
      if (scrollableElement.classList.contains('custom-scrollbar')) {
        setShowScrollTop(scrollableElement.scrollTop > 400);
      }
    };

    const scrollableSection = document.querySelector('.custom-scrollbar');
    if (scrollableSection) {
      scrollableSection.addEventListener('scroll', handleScroll);
      return () => scrollableSection.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);

      const handleSystemUpdate = () => {
        fetchNotifications();
      };

      window.addEventListener('system-update', handleSystemUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('system-update', handleSystemUpdate);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications').catch(() => ({ data: [] }));
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 100);
  };

  const scrollToTop = () => {
    const scrollableSection = document.querySelector('.custom-scrollbar');
    if (scrollableSection) {
      scrollableSection.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'user', 'superadmin'] },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'superadmin'] },
    { name: 'Users', icon: Users, path: '/users', roles: ['admin', 'superadmin'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'user', 'superadmin'] }
  ];

  const userRole = user?.role || 'user';
  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen w-full bg-backgroundClr text-primaryClr overflow-hidden" onClick={() => setShowNotifications(false)}>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-backgroundClr/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 bg-primaryClr/40 border-r border-primaryClr/5 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 relative flex flex-col h-full ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <button
            className="absolute top-6 right-6 lg:hidden text-primaryClr hover:text-secondaryClr"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>

          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-primaryClr text-white rounded-full items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform z-50"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div 
            className={`flex items-center gap-3 px-2 mb-10 cursor-pointer transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'justify-center p-0' : ''}`} 
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-primaryClr">
              <ShieldCheck className="w-8 h-8" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col animate-fadeIn">
                <span className="text-xl font-display font-bold text-primaryClr leading-tight">Admin</span>
                <span className="text-[10px] text-secondaryClr uppercase tracking-widest font-semibold mt-0.5 opacity-60">Control Panel</span>
              </div>
            )}
          </div>

          <nav className="space-y-2 flex-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link flex items-center overflow-hidden ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} ${isActive ? 'sidebar-link-active' : ''} transition-all duration-300`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isSidebarCollapsed && <span className="animate-fadeIn">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`mt-auto pt-6 border-t border-secondaryClr/5 ${isSidebarCollapsed ? 'w-full flex justify-center' : ''}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center text-primaryClr hover:text-status-cancelled rounded-xl transition-all duration-200 overflow-hidden ${isSidebarCollapsed ? 'p-3 justify-center' : 'gap-3 px-4 py-3 w-full'}`}
              title={isSidebarCollapsed ? 'Sign Out' : ''}
            >
              <LogOut size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span className="animate-fadeIn">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-primaryClr/30 backdrop-blur-md border-b border-secondaryClr/5 flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-primaryClr hover:text-secondaryClr transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm font-medium text-secondaryClr uppercase tracking-widest hidden sm:block truncate max-w-[200px] opacity-60">
              {location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-xl transition-all duration-300 relative ${showNotifications ? 'bg-primaryClr/10 text-primaryClr' : 'text-secondaryClr hover:text-primaryClr hover:bg-secondaryClr/5'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-primaryClr text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white shadow-lg transform translate-x-1/2 -translate-y-1/2">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-secondaryClr/5 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                  <div className="p-4 border-b border-secondaryClr/5 flex items-center justify-between bg-secondaryClr/5">
                    <h4 className="font-bold text-sm">Notifications</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center opacity-30">
                        <Bell size={32} className="mb-2" />
                        <p className="text-xs">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkRead(notif.id)}
                          className={`p-4 border-b border-secondaryClr/5 hover:bg-secondaryClr/5 transition-colors cursor-pointer group flex items-start gap-4 ${!notif.is_read ? 'bg-primaryClr/5' : ''}`}
                        >
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-primaryClr' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${!notif.is_read ? 'font-bold' : 'text-secondaryClr/70'}`}>{notif.title}</p>
                            <p className="text-[10px] text-secondaryClr/50 mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-4 bg-secondaryClr/5 px-4 py-2 rounded-2xl">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                <p className="text-[10px] text-secondaryClr/60 uppercase tracking-widest">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primaryClr/10 border border-primaryClr/20 flex items-center justify-center overflow-hidden">
                <img
                  src={user?.profileImage ? `http://localhost:5002${user.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=075985&color=fff`}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primaryClr hover:opacity-90 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-fadeInUp"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default Layout;

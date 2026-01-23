import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, FileWarning, Package, Settings, ShieldAlert, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppState } from '../../context/AppStateContext';

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const { userRole } = useAppState();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['AGENCY', 'CIVILIAN', 'VOLUNTEER'] },
    { to: '/map', icon: Map, label: 'Crisis Map', roles: ['AGENCY', 'CIVILIAN', 'VOLUNTEER'] },
    { to: '/report', icon: FileWarning, label: 'Report Incident', roles: ['CIVILIAN', 'VOLUNTEER', 'AGENCY'] },
    { to: '/resources', icon: Package, label: 'Resources', roles: ['AGENCY', 'VOLUNTEER'] },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['AGENCY'] },
    { to: '/admin', icon: ShieldAlert, label: 'Admin', roles: ['AGENCY'] },
  ];

  const SidebarContent = () => (
      <>
        <div className="p-6 border-b border-border flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <div>
            <h1 className="font-serif font-bold text-xl text-primary tracking-tight">ResQLink</h1>
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Crises Response</span>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose} // Close sidebar on click (mobile)
                className={({ isActive }) =>
                cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium",
                    isActive
                    ? "bg-primary/10 text-primary border-r-4 border-primary"
                    : "text-text-muted hover:bg-slate-100 hover:text-text"
                )
                }
            >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
            </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-border">
            <div className="bg-slate-50 p-4 rounded-lg border border-border">
            <p className="text-xs font-semibold text-text-muted uppercase mb-2">Current Role</p>
            <div className="flex items-center space-x-2">
                <div className={cn("w-2 h-2 rounded-full", userRole === 'AGENCY' ? "bg-primary" : userRole === 'VOLUNTEER' ? "bg-warning" : "bg-green-500")}></div>
                <span className="text-sm font-bold text-text">{userRole}</span>
            </div>
            </div>
        </div>
      </>
  );

  return (
    <>
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-surface border-r border-border h-screen flex-col fixed left-0 top-0 z-20 shadow-md hidden md:flex">
            <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose}></div>
                
                {/* Drawer */}
                <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
                    <SidebarContent />
                </aside>
            </div>
        )}
    </>
  );
};

export default Sidebar;

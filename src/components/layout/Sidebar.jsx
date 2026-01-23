import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, FileWarning, Package, Settings, ShieldAlert, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppState } from '../../context/AppStateContext';

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const { userRole } = useAppState();

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Command Center', roles: ['AGENCY', 'CIVILIAN', 'VOLUNTEER'] },
        { to: '/map', icon: Map, label: 'Crisis Map', roles: ['AGENCY', 'CIVILIAN', 'VOLUNTEER'] },
      ]
    },
    {
      title: 'Response',
      items: [
        { to: '/report', icon: FileWarning, label: 'Report Incident', roles: ['CIVILIAN', 'VOLUNTEER', 'AGENCY'] },
      ]
    },
    {
      title: 'Logistics',
      items: [
        { to: '/resources', icon: Package, label: 'Resources & Units', roles: ['AGENCY', 'VOLUNTEER'] },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['AGENCY'] },
      ]
    },
    {
      title: 'Admin',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'System Controls', roles: ['AGENCY'] },
      ]
    }
  ];

  const SidebarContent = () => (
      <div className="flex flex-col h-full bg-slate-900 text-slate-300">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/20">
                <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <div>
            <h1 className="font-sans font-bold text-lg text-white tracking-wide uppercase">ResQLink</h1>
            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold block">Mission Control</span>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navGroups.map((group, idx) => {
                const visibleItems = group.items.filter(item => item.roles.includes(userRole));
                if (visibleItems.length === 0) return null;

                return (
                    <div key={idx}>
                        <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{group.title}</h3>
                        <div className="space-y-1">
                            {visibleItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={onMobileClose}
                                    className={({ isActive }) =>
                                    cn(
                                        "flex items-center space-x-3 px-4 py-2.5 rounded-md transition-all duration-200 group text-sm font-medium border-l-2",
                                        isActive
                                        ? "bg-blue-600/10 text-blue-400 border-blue-500"
                                        : "border-transparent hover:bg-slate-800 hover:text-white"
                                    )
                                    }
                                >
                                    <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="bg-slate-900 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Active Role</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", userRole === 'AGENCY' ? "bg-blue-500" : userRole === 'VOLUNTEER' ? "bg-yellow-500" : "bg-green-500")}></div>
                        <span className="text-xs font-bold text-white">{userRole}</span>
                    </div>
                </div>
                <Settings className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-pointer" />
            </div>
        </div>
      </div>
  );

  return (
    <>
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex-col fixed left-0 top-0 z-20 hidden md:flex">
            <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onMobileClose}></div>
                <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-slate-800">
                    <SidebarContent />
                </aside>
            </div>
        )}
    </>
  );
};

export default Sidebar;

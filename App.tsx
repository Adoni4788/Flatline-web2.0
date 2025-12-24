import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Card, Badge, Icons, Modal, Select, Toast, BarChart } from './components/ui';
import { DataProvider, useData } from './lib/context';
import { User, Course } from './lib/types';

// --- Scroll To Top Hook ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Notification Hook ---
const useNotification = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
    };
    const closeToast = () => setToast(null);
    return { toast, showToast, closeToast };
};

// --- Layouts ---

const PublicLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-gray-100 font-sans selection:bg-red-500/30 selection:text-white">
      <nav 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? 'border-b border-white/10 bg-[#030712]/90 backdrop-blur-md py-4' 
            : 'border-b border-transparent bg-transparent py-8'
        }`}
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold font-archivo text-h5 tracking-tighter text-white group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all duration-500">
              <Icons.Shield className="h-6 w-6 text-white" />
            </div>
            <span className="tracking-tight">FLATLINE<span className="text-red-500">SECURITY</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-subtitle2 font-archivo text-gray-300">
            <Link 
              to="/" 
              className={`hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-red-600 after:transition-all hover:after:w-full ${isActive('/') ? 'text-white after:w-full' : 'after:w-0'}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-red-600 after:transition-all hover:after:w-full ${isActive('/about') ? 'text-white after:w-full' : 'after:w-0'}`}
            >
              About
            </Link>
            <Link 
              to="/services" 
              className={`hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-red-600 after:transition-all hover:after:w-full ${isActive('/services') ? 'text-white after:w-full' : 'after:w-0'}`}
            >
              Services
            </Link>
            <Link 
              to="/contact" 
              className={`hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-red-600 after:transition-all hover:after:w-full ${isActive('/contact') ? 'text-white after:w-full' : 'after:w-0'}`}
            >
              Contact
            </Link>
          </div>
          <Link to="/login">
            <Button variant="primary" size="lg" className="hidden sm:inline-flex shadow-lg shadow-red-900/20 hover:scale-105 transition-transform border border-red-500/20">Access Portal</Button>
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 bg-[#02040a] py-20 text-body2 text-gray-500">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 grid md:grid-cols-4 gap-12 lg:gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold font-archivo text-h5 text-white">
              <Icons.Shield className="h-6 w-6 text-red-600" />
              FLATLINE SECURITY
            </div>
            <p className="text-gray-400 leading-relaxed text-body1">Setting the standard in professional security services and comprehensive training solutions for a safer world.</p>
            <div className="flex gap-4 pt-2">
               {['FB', 'IG', 'LI', 'X'].map((social) => (
                   <div key={social} className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all cursor-pointer text-caption1 font-bold border border-white/5 hover:border-red-500">
                       {social}
                   </div>
               ))}
            </div>
          </div>
          <div>
            <h3 className="font-archivo text-white text-h6 mb-8">Quick Links</h3>
            <ul className="space-y-4 text-body1">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Contact', path: '/contact' }
              ].map(item => (
                  <li key={item.name}>
                      <Link to={item.path} className="hover:text-red-500 transition-colors flex items-center gap-2 group">
                          <Icons.ChevronRight className="h-3 w-3 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {item.name}
                      </Link>
                  </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-archivo text-white text-h6 mb-8">Contact Us</h3>
            <ul className="space-y-5 text-body1">
              <li className="flex items-start gap-3">
                <Icons.MapPin className="h-5 w-5 mt-1 text-red-600 shrink-0" />
                <span>Runaway Bay, St Ann, Jamaica</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Phone className="h-5 w-5 text-red-600 shrink-0" />
                <span>+44 (0) 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Mail className="h-5 w-5 text-red-600 shrink-0" />
                <span>info@fstsolutionsltd.com</span>
              </li>
            </ul>
          </div>
          <div>
             <h3 className="font-archivo text-white text-h6 mb-8">Newsletter</h3>
             <p className="mb-6 text-gray-400 text-body1">Subscribe for safety tips and updates.</p>
             <div className="flex gap-2">
               <Input placeholder="Email" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-red-600 h-12" />
               <Button size="icon" className="bg-red-600 hover:bg-red-700 shrink-0 h-12 w-12"><Icons.ChevronRight className="h-5 w-5" /></Button>
             </div>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-20 pt-8 border-t border-white/5 text-center text-gray-600 flex flex-col md:flex-row justify-between items-center gap-6 text-caption">
          <p>&copy; 2025 Flatline Security. All rights reserved.</p>
          <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StudentLayout = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, logout } = useData();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Icons.LayoutDashboard, label: 'Dashboard', path: '/portal/dashboard' },
    { icon: Icons.BookOpen, label: 'My Training', path: '/portal/courses' },
    { icon: Icons.Award, label: 'Certifications', path: '/portal/certifications' },
  ];

  const SidebarContent = () => (
      <>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
            <Icons.Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-archivo tracking-tight text-h6 font-medium">Student Portal</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-subtitle2 font-archivo transition-all ${
                location.pathname.startsWith(item.path)
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg bg-white/5 border border-white/5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center text-caption1 text-white shadow-inner">
              {currentUser?.firstName[0]}{currentUser?.lastName[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-subtitle2 font-medium text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="truncate text-caption text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active Trainee
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10">
            <Icons.LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </>
  );

  return (
    <div className="min-h-screen flex bg-[#030712] text-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#060a15] md:flex sticky top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="relative w-64 h-full bg-[#060a15] border-r border-white/10 flex flex-col shadow-2xl animate-fade-in">
                  <SidebarContent />
              </div>
          </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex h-16 items-center justify-between border-b border-white/10 px-4 bg-[#060a15] sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
                <Icons.Shield className="h-4 w-4 text-white" />
             </div>
             <span className="font-archivo font-medium">Student Portal</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}><Icons.Menu className="h-5 w-5" /></Button>
        </header>
        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-grid-pattern pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, logout } = useData();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Icons.LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Icons.BookOpen, label: 'Training Modules', path: '/admin/courses' },
    { icon: Icons.Users, label: 'Trainees', path: '/admin/users' },
    { icon: Icons.Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const SidebarContent = () => (
      <>
        <div className="flex h-16 items-center gap-2 border-b border-red-900/20 px-6 bg-[#0f0404]">
          <div className="h-6 w-6 rounded bg-red-800 flex items-center justify-center">
            <Icons.Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-archivo tracking-tight text-red-50 text-h6">ADMIN CONSOLE</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 bg-[#0a0505]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-subtitle2 font-archivo transition-all ${
                location.pathname.startsWith(item.path)
                  ? 'bg-red-900/30 text-red-200 border border-red-900/30 shadow-sm'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="border-t border-red-900/20 p-4 bg-[#0a0505]">
          <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg bg-red-950/20 border border-red-900/20">
            <div className="h-9 w-9 rounded-full bg-red-900 border border-red-700 flex items-center justify-center text-caption1 text-white shadow-inner">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-subtitle2 font-medium text-white">Administrator</p>
              <p className="truncate text-caption text-red-400">System Control</p>
            </div>
          </div>
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-900/20">
            <Icons.LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </>
  );

  return (
    <div className="min-h-screen flex bg-[#030712] text-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-red-900/20 bg-[#0f0404] md:flex sticky top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="relative w-64 h-full bg-[#0a0505] border-r border-red-900/20 flex flex-col shadow-2xl animate-fade-in">
                  <SidebarContent />
              </div>
          </div>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex h-16 items-center justify-between border-b border-white/10 px-4 bg-[#0f0404] sticky top-0 z-30">
          <span className="font-bold text-red-500 font-archivo text-h6">Admin Console</span>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}><Icons.Menu className="h-5 w-5" /></Button>
        </header>
        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-grid-pattern pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Pages ---

const LandingPage = () => {
  const galleryItems = [
      { 
          title: "Tactical Response", 
          category: "Advanced",
          img: "https://images.unsplash.com/photo-1551817958-c9c450974b7c?q=80&w=2070&auto=format&fit=crop",
          className: "md:col-span-2 md:row-span-2" 
      },
      { 
          title: "Range Safety", 
          category: "Fundamentals",
          img: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=2070&auto=format&fit=crop",
          className: "md:col-span-1 md:row-span-1" 
      },
      { 
          title: "Cyber Warfare", 
          category: "Intelligence",
          img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop",
          className: "md:col-span-1 md:row-span-2" 
      },
      { 
          title: "Team Briefing", 
          category: "Leadership",
          img: "https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?q=80&w=1470&auto=format&fit=crop",
          className: "md:col-span-1 md:row-span-1" 
      }
  ];

  return (
    <div className="space-y-0 pb-0 bg-[#030712]">
      {/* Hero Section - Elite Standard */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1551817958-c9c450974b7c?q=80&w=2070&auto=format&fit=crop" 
             alt="Security Background" 
             className="w-full h-full object-cover opacity-20 grayscale"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-[#030712]" />
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />
         </div>
         
         <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-caption1 font-archivo mb-8 animate-fade-in backdrop-blur-md">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
             </span>
             Elite Security & Intelligence Training
           </div>
           
           <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-archivo tracking-tighter text-white mb-8 animate-fade-in drop-shadow-2xl leading-[0.9]">
             FLATLINE<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
               SECURITY
             </span>
           </h1>
           
           <p className="text-h5 text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in font-light border-l-2 border-red-600 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
             Forging the next generation of operators through military-grade discipline and real-world tactical scenarios.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in items-center">
             <Link to="/login">
               <Button size="lg" className="rounded-none h-14 px-10 text-subtitle1 tracking-widest uppercase hover:bg-red-700 bg-red-600 border border-red-500 transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                 Start Training
               </Button>
             </Link>
             <Link to="/services">
               <Button variant="ghost" size="lg" className="rounded-none h-14 px-10 text-subtitle1 tracking-widest uppercase text-gray-300 hover:text-white hover:bg-white/5 border-b border-white/20 hover:border-white transition-all duration-300">
                 Our Services
               </Button>
             </Link>
           </div>
         </div>
         
         {/* Scroll Indicator */}
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <Icons.ChevronRight className="h-4 w-4 rotate-90" />
         </div>
      </section>

      {/* Who We Are Section (The Standard) */}
      <section className="py-32 bg-[#030712] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                {/* Image Side - Composition */}
                <div className="relative group">
                    <div className="relative z-10 rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#0a0f1c]">
                        <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay z-10"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
                            alt="Elite Team" 
                            className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                        />
                    </div>
                    {/* Decorative Offset Border */}
                    <div className="absolute top-6 -right-6 w-full h-full border border-red-900/30 rounded-sm -z-0 hidden md:block transition-all duration-500 group-hover:top-4 group-hover:-right-4 group-hover:border-red-600/50"></div>
                    
                    {/* Floating Stat Card */}
                    <div className="absolute -bottom-10 -left-10 z-20 hidden md:block">
                        <Card className="p-6 flex items-center gap-5 bg-[#0a0f1c]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-none border-l-4 border-l-red-600">
                           <div className="text-center px-2">
                                <span className="block text-3xl font-bold font-archivo text-white">15+</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-500">Years</span>
                           </div>
                           <div className="w-px h-10 bg-white/10"></div>
                           <div className="text-center px-2">
                                <span className="block text-3xl font-bold font-archivo text-white">2k+</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-500">Graduates</span>
                           </div>
                        </Card>
                    </div>
                </div>

                {/* Text Side */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-red-600"></span>
                            <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs">Who We Are</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-archivo font-medium text-white leading-[1.1]">
                            Defining the Standard of <span className="text-gray-500">Modern Security.</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-6 text-gray-400 font-light text-lg leading-relaxed">
                        <p>
                            Flatline Security was forged from the necessity for higher standards in the private sector. Founded by former special operations veterans, we translate high-stakes field experience into actionable, civilian-appropriate security protocols.
                        </p>
                        <p>
                            We don't just train; we instill a mindset. Our approach combines tactical precision with strategic foresight, ensuring our clients and trainees are prepared for the unpredictable nature of today's threat landscape.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-5">
                        <Link to="/about">
                            <Button className="rounded-full px-8 h-12 border border-white/20 hover:border-red-500 hover:bg-red-600/10 transition-all text-white" variant="outline">
                                Discover Our Heritage
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Why Choose Us - Redesigned to Match Standard */}
      <section className="py-32 bg-[#050810] relative border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Our Advantage</span>
                <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Why Choose Flatline?</h2>
                <p className="text-lg text-gray-400 font-light">
                    Founded by former special operations personnel, we bring military-grade precision to civilian security. 
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Certified Instructors", desc: "Learn from experienced professionals with proven field records.", icon: Icons.Award },
                    { title: "Scenario Based", desc: "Practical, immersive training environments that mimic real-world threats.", icon: Icons.Users },
                    { title: "Global Standards", desc: "Curriculum aligned with international best practices and protocols.", icon: Icons.Globe },
                    { title: "Custom Solutions", desc: "Tailored security strategies for individuals, businesses, and VIPs.", icon: Icons.Settings },
                    { title: "Proven Success", desc: "A track record of reliability and high success rates in all operations.", icon: Icons.Shield },
                    { title: "Trusted Partner", desc: "The preferred choice for local organizations and internal agencies.", icon: Icons.Check }
                ].map((item, idx) => (
                    <div key={idx} className="group relative p-8 bg-[#0a0f1c] border border-white/5 hover:border-red-500/50 transition-all duration-500 overflow-hidden">
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/0 to-red-900/0 group-hover:from-red-900/10 group-hover:to-transparent transition-all duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="h-14 w-14 mb-6 flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-red-500/50 group-hover:bg-red-600/10 transition-all duration-300">
                                <item.icon className="h-6 w-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-archivo font-medium text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                            <p className="text-body2 text-gray-500 group-hover:text-gray-400 leading-relaxed transition-colors">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Services Preview Section - Redesigned */}
      <section className="py-32 bg-[#030712] relative border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Capabilities</span>
                <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Expertise You Can Trust</h2>
                <p className="text-lg text-gray-400 font-light">
                  We offer a wide array of specialized security services and training modules designed for the modern world.
                </p>
              </div>
              <Link to="/services">
                <Button variant="outline" className="rounded-full px-8 border-white/20 hover:border-white text-white">View All Services</Button>
              </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { title: "Firearms Training", icon: Icons.Shield, desc: "Tactical shooting mastery." },
               { title: "Executive Protection", icon: Icons.Users, desc: "High-stakes VIP security protocols." },
               { title: "Risk Consultation", icon: Icons.FileText, desc: "Comprehensive threat assessment." },
             ].map((s, i) => (
                <Link to="/services" key={i} className="group block h-full">
                    <div className="relative h-full p-10 bg-[#0a0f1c] border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col justify-between overflow-hidden">
                        {/* Background Image Effect (Subtle) */}
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                             <s.icon className="w-40 h-40" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300 shadow-lg">
                               <s.icon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-archivo font-medium text-white mb-3">{s.title}</h3>
                            <p className="text-gray-500 group-hover:text-gray-400 transition-colors">{s.desc}</p>
                        </div>
                        
                        <div className="relative z-10 mt-8 flex items-center gap-2 text-red-500 text-sm font-medium tracking-wide uppercase opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                            Explore <Icons.ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </Link>
             ))}
          </div>
        </div>
      </section>
      
      {/* Training Gallery Preview - Redesigned Interaction */}
      <section className="py-32 bg-[#050810] relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Visuals</span>
               <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Training in Action</h2>
               <p className="text-lg text-gray-400 font-light">Experience our immersive training environments designed for real-world application.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 h-auto md:h-[700px]">
                {galleryItems.map((item, idx) => (
                    <div key={idx} className={`relative group overflow-hidden border border-white/10 bg-[#0a0f1c] ${item.className}`}>
                        {/* Image with Grayscale to Color Effect */}
                        <img 
                            src={item.img} 
                            alt={item.title} 
                            className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-red-500 font-bold text-[10px] tracking-widest uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.category}</span>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-white font-archivo text-2xl font-medium leading-tight">{item.title}</h3>
                                    <div className="h-10 w-10 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                                        <Icons.ChevronRight className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-16">
                <Link to="/about">
                    <Button variant="outline" className="rounded-full h-14 px-10 text-lg border-white/10 hover:border-white text-white">View Full Gallery</Button>
                </Link>
            </div>
        </div>
      </section>

      {/* Contact Details Section (New) - Redesigned */}
      <section className="py-32 bg-[#030712] border-t border-white/5">
         <div className="container mx-auto max-w-7xl px-4 md:px-8">
             <div className="text-center max-w-3xl mx-auto mb-20">
                 <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Connect</span>
                 <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Get In Touch</h2>
                 <p className="text-lg text-gray-400 font-light">Reach out to us directly for immediate assistance or inquiries.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                     { icon: Icons.Phone, title: "Call Us", line1: "+44 (0) 123 456 7890", line2: "Mon-Fri, 9am-6pm" },
                     { icon: Icons.Mail, title: "Email Us", line1: "info@fstsolutionsltd.com", line2: "24/7 Support" },
                     { icon: Icons.MapPin, title: "Visit Us", line1: "Runaway Bay, St Ann", line2: "Jamaica" }
                 ].map((c, i) => (
                     <div key={i} className="group p-10 flex flex-col items-center text-center bg-[#0a0f1c] border border-white/5 hover:border-red-500/30 transition-all duration-500 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-gray-300 group-hover:text-red-500 group-hover:border-red-500/50 transition-all duration-300 relative z-10">
                             <c.icon className="h-7 w-7" />
                         </div>
                         <h3 className="text-xl font-bold font-archivo text-white mb-3 relative z-10">{c.title}</h3>
                         <p className="text-gray-400 text-body1 relative z-10">{c.line1}</p>
                         <p className="text-gray-600 text-sm mt-1 relative z-10">{c.line2}</p>
                     </div>
                 ))}
             </div>
         </div>
      </section>

      {/* CTA Section - Elite Gradient */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#050810]"></div>
        {/* Abstract Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <div className="bg-gradient-to-r from-[#0a0f1c] to-[#0a0f1c] border border-white/10 p-16 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-red-900/50"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-red-900/50"></div>

            <div className="max-w-3xl relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold font-archivo text-white mb-6 tracking-tight">Ready to Elevate Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Security Standards?</span></h2>
              <p className="text-xl text-gray-400 font-light mb-12">Join elite professionals and secure your future with our world-class training programs.</p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/login">
                  <Button size="lg" className="h-16 px-12 text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-shadow">
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-lg uppercase tracking-widest border-white/20 hover:bg-white/5 hover:border-white text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="bg-[#030712]">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
             alt="Team Background" 
             className="w-full h-full object-cover grayscale opacity-30"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/50 to-[#030712]"></div>
        </div>
        <div className="relative z-10 text-center px-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 rounded-full backdrop-blur-md">
                 <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                 <span className="text-[10px] uppercase tracking-widest text-gray-300">Since 2010</span>
             </div>
             <h1 className="text-6xl md:text-8xl font-bold font-archivo tracking-tighter text-white mb-6">OUR HERITAGE</h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Forged in conflict. Refined for peace. Defining the new standard.</p>
        </div>
      </section>

      {/* Main Content - Composition Style */}
      <section className="py-24 container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="relative group">
                   <div className="relative z-10 rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#0a0f1c]">
                       <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay z-10"></div>
                       <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Team" />
                   </div>
                   {/* Decorative Offset Border */}
                   <div className="absolute top-6 -left-6 w-full h-full border border-red-900/30 rounded-sm -z-0 hidden md:block transition-all duration-500 group-hover:top-4 group-hover:-left-4 group-hover:border-red-600/50"></div>
               </div>
               
               <div className="space-y-8">
                   <div>
                       <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-red-600"></span>
                            <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs">The Story</span>
                        </div>
                       <h2 className="text-4xl md:text-5xl font-archivo font-medium text-white leading-[1.1]">Origins of Excellence.</h2>
                   </div>
                   <div className="space-y-6 text-gray-400 font-light text-lg leading-relaxed">
                       <p>
                           Flatline Security was founded by a cadre of former special operations personnel who recognized a critical gap in the private security sector. We saw a need for training that went beyond the theoretical—training that was rooted in real-world experience and tactical reality.
                       </p>
                       <p>
                           Today, we stand as a beacon of excellence, providing top-tier security services and comprehensive training programs to individuals, corporations, and government entities. Our commitment to precision is unwavering.
                       </p>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 mt-8">
                       {[
                           { val: "15+", label: "Years Active" },
                           { val: "2k+", label: "Graduates" },
                           { val: "100%", label: "Commitment" }
                       ].map((stat, i) => (
                           <div key={i}>
                               <div className="text-3xl font-bold font-archivo text-white">{stat.val}</div>
                               <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      </section>
      
      {/* Values - Updated Grid */}
      <div className="bg-[#050810] py-32 border-y border-white/5">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
              <div className="text-center mb-20 max-w-3xl mx-auto">
                  <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Philosophy</span>
                  <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Core Values</h2>
                  <p className="text-lg text-gray-400 font-light">The pillars that define every operation we undertake.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      { title: "Integrity", desc: "We operate with unshakeable honesty and strong moral principles. Trust is our currency." },
                      { title: "Vigilance", desc: "Constant awareness and readiness. We identify threats before they manifest." },
                      { title: "Precision", desc: "Exacting standards in training and execution. There is no room for error." }
                  ].map((v, i) => (
                      <div key={i} className="group p-10 bg-[#0a0f1c] border border-white/5 hover:border-red-500/30 transition-all duration-500 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="h-16 w-16 mx-auto bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300 relative z-10">
                              <Icons.Shield className="h-8 w-8 text-gray-300 group-hover:text-white" />
                          </div>
                          <h3 className="text-2xl font-medium font-archivo text-white mb-4 text-center relative z-10">{v.title}</h3>
                          <p className="text-gray-400 leading-relaxed text-center font-light relative z-10">{v.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </div>
      
      {/* Why Choose Flatline (Duplicate from Homepage) */}
      <section className="py-32 bg-[#050810] relative border-b border-white/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Our Advantage</span>
                <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Why Choose Flatline?</h2>
                <p className="text-lg text-gray-400 font-light">
                    Founded by former special operations personnel, we bring military-grade precision to civilian security. 
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Certified Instructors", desc: "Learn from experienced professionals with proven field records.", icon: Icons.Award },
                    { title: "Scenario Based", desc: "Practical, immersive training environments that mimic real-world threats.", icon: Icons.Users },
                    { title: "Global Standards", desc: "Curriculum aligned with international best practices and protocols.", icon: Icons.Globe },
                    { title: "Custom Solutions", desc: "Tailored security strategies for individuals, businesses, and VIPs.", icon: Icons.Settings },
                    { title: "Proven Success", desc: "A track record of reliability and high success rates in all operations.", icon: Icons.Shield },
                    { title: "Trusted Partner", desc: "The preferred choice for local organizations and internal agencies.", icon: Icons.Check }
                ].map((item, idx) => (
                    <div key={idx} className="group relative p-8 bg-[#0a0f1c] border border-white/5 hover:border-red-500/50 transition-all duration-500 overflow-hidden">
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/0 to-red-900/0 group-hover:from-red-900/10 group-hover:to-transparent transition-all duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="h-14 w-14 mb-6 flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-red-500/50 group-hover:bg-red-600/10 transition-all duration-300">
                                <item.icon className="h-6 w-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-archivo font-medium text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                            <p className="text-body2 text-gray-500 group-hover:text-gray-400 leading-relaxed transition-colors">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Instructors Section - Updated Cards */}
      <section className="py-32 container mx-auto max-w-7xl px-4 md:px-8">
             <div className="text-center max-w-3xl mx-auto mb-20">
                 <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-3 block">Personnel</span>
                 <h2 className="text-4xl md:text-5xl font-archivo text-white mb-6">Meet The Instructors</h2>
                 <p className="text-lg text-gray-400 font-light">Learn from the best. Our team consists of former military and special operations veterans.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                     { name: "Major Alan Dutch", role: "Head Instructor", bio: "Former Special Forces operative with 20 years of field experience in counter-terrorism.", img: "https://images.unsplash.com/photo-1531891437567-31b44368cc76?q=80&w=1000&auto=format&fit=crop" },
                     { name: "Sarah Connor", role: "Tactical Evasion", bio: "Specialist in defensive driving and urban evasion tactics for high-risk assets.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" },
                     { name: "John Matrix", role: "CQC Expert", bio: "Master of close-quarters combat and hand-to-hand defense techniques.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop" }
                 ].map((inst, i) => (
                     <div key={i} className="group relative bg-[#0a0f1c] border border-white/5 overflow-hidden hover:border-red-500/30 transition-all duration-500">
                         <div className="h-96 overflow-hidden relative">
                            <img src={inst.img} alt={inst.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent opacity-90"></div>
                         </div>
                         <div className="absolute bottom-0 left-0 w-full p-8">
                             <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                 <h3 className="text-2xl font-archivo font-medium text-white mb-1">{inst.name}</h3>
                                 <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">{inst.role}</p>
                                 <p className="text-gray-400 font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{inst.bio}</p>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
      </section>
      
      {/* CTA - Same as Homepage */}
      <section className="py-32 relative overflow-hidden bg-[#030712] border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-900/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-archivo text-white mb-8">Join the Ranks</h2>
            <p className="text-xl text-gray-400 font-light mb-12 max-w-2xl mx-auto">Experience the difference that professional training makes. Start your journey with Flatline Security today.</p>
            <Link to="/login">
                  <Button size="lg" className="h-16 px-12 text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-shadow">
                    Get Started Now
                  </Button>
            </Link>
        </div>
      </section>
    </div>
  );
};

const ServicesPage = () => {
  return (
    <div className="bg-[#030712]">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?q=80&w=1470&auto=format&fit=crop" 
             alt="Services Background" 
             className="w-full h-full object-cover grayscale opacity-30"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/50 to-[#030712]"></div>
        </div>
        <div className="relative z-10 text-center px-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 rounded-full backdrop-blur-md">
                 <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                 <span className="text-[10px] uppercase tracking-widest text-gray-300">Full Spectrum</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold font-archivo tracking-tighter text-white mb-6">OPERATIONAL CAPABILITIES</h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Comprehensive security solutions and elite training modules designed for the modern threat landscape.</p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-24">
          
          {/* Section 1: Training */}
          <div className="mb-32">
              <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-2 block">Skill Acquisition</span>
                    <h2 className="text-4xl font-bold font-archivo text-white">Specialized Training</h2>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Advanced Firearms", desc: "Master the art of tactical shooting, movement, and rapid target acquisition under stress.", icon: Icons.Shield },
                  { title: "Close Quarters Combat", desc: "Hand-to-hand defense techniques for confined spaces and sudden encounters.", icon: Icons.Users },
                  { title: "Tactical Medicine", desc: "Emergency trauma care under fire. Tourniquet application, wound packing, and extraction.", icon: Icons.Plus },
                  { title: "Defensive Driving", desc: "Evasive maneuvers, convoy operations, and vehicle dynamics for high-risk environments.", icon: Icons.Settings },
                  { title: "Urban Survival", desc: "Navigation, resource procurement, and evasion in hostile urban settings.", icon: Icons.MapPin },
                  { title: "Situational Awareness", desc: "The psychology of observation and threat detection before incidents occur.", icon: Icons.Search },
                ].map((s, i) => (
                  <div key={i} className="group p-8 bg-[#0a0f1c] border border-white/5 hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-500 transition-colors relative z-10">
                      <s.icon className="h-6 w-6 text-gray-300 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-medium font-archivo text-white mb-3 relative z-10">{s.title}</h3>
                    <p className="text-gray-400 text-body2 leading-relaxed font-light relative z-10">{s.desc}</p>
                  </div>
                ))}
              </div>
          </div>

          {/* Section 2: Security Services */}
          <div>
              <div className="flex items-end justify-between mb-16 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-2 block">Protection</span>
                    <h2 className="text-4xl font-bold font-archivo text-white">Security Services</h2>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Executive Protection", desc: "Discreet and professional protection for VIPs, executives, and dignitaries. Our agents are trained in low-profile operations to ensure safety without intrusion.", icon: Icons.Users },
                  { title: "Event Security", desc: "Comprehensive security planning and execution for large-scale events, corporate gatherings, and private functions. Crowd control, access management, and emergency response.", icon: Icons.Shield },
                  { title: "Risk Consultation", desc: "Full-spectrum risk assessment for facilities and organizations. We identify vulnerabilities and design robust security protocols.", icon: Icons.FileText },
                  { title: "Cyber Security", desc: "Digital asset protection, penetration testing, and counter-surveillance for the modern digital battlefield.", icon: Icons.Settings },
                ].map((s, i) => (
                  <div key={i} className="group p-10 bg-[#0a0f1c] border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                    {/* Background Icon Watermark */}
                    <div className="absolute -right-6 -bottom-6 text-white/5 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                         <s.icon className="h-40 w-40" />
                    </div>
                    
                    <div className="h-16 w-16 shrink-0 rounded-none bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                      <s.icon className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-medium font-archivo text-white mb-3">{s.title}</h3>
                        <p className="text-gray-400 text-body1 leading-relaxed font-light mb-8">{s.desc}</p>
                        <Link to="/contact">
                            <Button variant="outline" size="sm" className="border-white/10 hover:border-white hover:bg-transparent rounded-none">Request Consultation</Button>
                        </Link>
                    </div>
                  </div>
                ))}
              </div>
          </div>

      </div>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div className="bg-[#030712]">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
             alt="Contact Background" 
             className="w-full h-full object-cover grayscale opacity-30"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/50 to-[#030712]"></div>
        </div>
        <div className="relative z-10 text-center px-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/5 rounded-full backdrop-blur-md">
                 <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] uppercase tracking-widest text-gray-300">Channels Open</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold font-archivo tracking-tighter text-white mb-6">SECURE COMMS</h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">Initiate contact for consultations, course enrollment, or sensitive inquiries.</p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Contact Info Side */}
            <div className="space-y-16">
                <div>
                    <h3 className="text-3xl font-bold font-archivo text-white mb-8 border-l-4 border-red-600 pl-4">Direct Lines</h3>
                    <div className="space-y-6">
                     {[
                         { icon: Icons.MapPin, title: "Headquarters", lines: ["123 Security Blvd, Runaway Bay", "St Ann, Jamaica"] },
                         { icon: Icons.Mail, title: "Electronic Mail", lines: ["info@fstsolutionsltd.com", "support@flatline.com"] },
                         { icon: Icons.Phone, title: "Operations Center", lines: ["+44 (0) 123 456 7890", "Mon-Fri, 0900-1800 EST"] }
                     ].map((c, i) => (
                         <div key={i} className="flex items-start gap-6 group p-6 border border-white/5 hover:border-white/10 bg-[#0a0f1c] transition-all">
                            <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                               <c.icon className="h-6 w-6" />
                            </div>
                            <div>
                               <h4 className="text-lg font-medium font-archivo text-white mb-1">{c.title}</h4>
                               {c.lines.map((line, idx) => <p key={idx} className="text-gray-400 font-light">{line}</p>)}
                            </div>
                         </div>
                     ))}
                  </div>
                </div>

                {/* FAQ Mini Section */}
                <div>
                    <h3 className="text-3xl font-bold font-archivo text-white mb-8 border-l-4 border-gray-700 pl-4">Intel Brief</h3>
                    <div className="space-y-4">
                        {[
                            { q: "Do I need prior experience for basic training?", a: "No, our Level 1 courses are designed for complete beginners." },
                            { q: "Do you offer private corporate training?", a: "Yes, we can customize training packages for corporate teams on-site or at our facility." },
                            { q: "Are your certifications recognized internationally?", a: "Many of our advanced certifications adhere to international security standards (ISO)." }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 bg-[#0a0f1c] border-l border-white/10">
                                <h4 className="font-medium text-white text-lg mb-2">{faq.q}</h4>
                                <p className="text-gray-400 font-light leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="relative">
               {/* Decorative background for form */}
               <div className="absolute -inset-4 bg-gradient-to-r from-red-900/20 to-transparent blur-2xl opacity-50 pointer-events-none"></div>
               
               <Card className="p-8 md:p-12 bg-[#0a0f1c]/90 border border-white/10 shadow-2xl relative backdrop-blur-xl rounded-none">
                  <div className="mb-10">
                      <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs mb-2 block">Transmission</span>
                      <h3 className="text-3xl font-archivo text-white">Send Message</h3>
                  </div>
                  
                  <form className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">First Name</label>
                           <Input placeholder="John" className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Name</label>
                           <Input placeholder="Doe" className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</label>
                        <Input type="email" placeholder="john@example.com" className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subject</label>
                        <Select className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none text-gray-300">
                           <option>General Inquiry</option>
                           <option>Course Enrollment</option>
                           <option>Security Services</option>
                           <option>Corporate Consultation</option>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Message</label>
                        <Textarea placeholder="Secure transmission content..." className="bg-black/40 border-gray-800 focus:border-red-600 h-40 rounded-none p-4" />
                     </div>
                     <Button size="lg" className="w-full h-16 font-bold text-lg uppercase tracking-widest bg-red-600 hover:bg-red-700 rounded-none shadow-lg shadow-red-900/20">
                         Transmit Message
                     </Button>
                  </form>
               </Card>
            </div>

        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate network delay for realism
    setTimeout(async () => {
        const success = await login(email);
        if (success) {
            if (email.includes('admin')) {
                navigate('/admin/dashboard');
            } else {
                navigate('/portal/dashboard');
            }
        } else {
            setError('Invalid credentials.');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 pt-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full animate-pulse"></div>
      
      <Card className="w-full max-w-md p-10 relative z-10 border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/50">
            <Icons.Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-h2 font-archivo tracking-tight text-white">Welcome Back</h1>
          <p className="text-body2 text-gray-400 mt-3">Sign in to access your secure training portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-caption1 font-medium text-gray-300 ml-1">Email Address</label>
            <Input 
              type="email" 
              placeholder="user@flatline.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
              className="h-14"
            />
          </div>
          <div className="space-y-2">
            <label className="text-caption1 font-medium text-gray-300 ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              className="h-14"
            />
          </div>
          {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-caption1 font-medium text-center">{error}</div>}
          <Button type="submit" size="lg" className="w-full h-14 shadow-lg shadow-red-900/20" disabled={isLoading}>
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                </span>
            ) : "Sign In"}
          </Button>
        </form>
        <div className="mt-10 pt-8 border-t border-white/10 text-center space-y-3">
           <div className="text-caption1 text-gray-500 uppercase font-semibold tracking-wider">Demo Credentials</div>
           <div className="flex flex-col sm:flex-row justify-center gap-3 text-caption">
              <code className="px-3 py-1.5 rounded bg-white/5 text-gray-300 cursor-pointer hover:text-white transition-colors" onClick={() => setEmail('admin@flatline.com')}>admin@flatline.com</code>
              <code className="px-3 py-1.5 rounded bg-white/5 text-gray-300 cursor-pointer hover:text-white transition-colors" onClick={() => setEmail('john.wick@continental.com')}>john.wick@continental.com</code>
           </div>
        </div>
      </Card>
    </div>
  );
};

// --- Student Pages ---

const StudentDashboard = () => {
  const { currentUser, courses, enrollments, getCourseProgress, enrollUser } = useData();
  const { toast, showToast, closeToast } = useNotification();
  
  const enrolledCourses = courses.filter(c => enrollments.some(e => e.userId === currentUser?.id && e.courseId === c.id));
  const availableCourses = courses.filter(c => !enrollments.some(e => e.userId === currentUser?.id && e.courseId === c.id));
  
  const handleEnroll = (courseId: string, courseTitle: string) => {
      if (currentUser) {
          enrollUser(currentUser.id, courseId);
          showToast(`Successfully enrolled in ${courseTitle}`);
      }
  };

  const activeCourse = enrolledCourses.find(c => {
      const p = getCourseProgress(currentUser!.id, c.id);
      return p > 0 && p < 100;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-h1 font-archivo tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2 text-h6 font-light">Track your progress and access new training modules.</p>
        </div>
        <div className="text-right hidden sm:block">
          <Badge variant="success" className="px-4 py-1.5 text-caption1">Active Status: Clear</Badge>
        </div>
      </div>

      {/* Hero: Continue Learning */}
      {activeCourse && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1c] p-10 shadow-2xl group">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-red-600/10 blur-[100px]"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-full md:w-auto flex-shrink-0">
                    <div className="relative h-48 w-72 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <img src={activeCourse.image} alt={activeCourse.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Icons.Play className="h-6 w-6 text-white fill-current ml-1" />
                            </div>
                        </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <Badge className="bg-red-500 text-white border-transparent px-3 py-1">In Progress</Badge>
                        <span className="text-caption1 text-gray-400 font-mono uppercase tracking-wide">Last accessed 2h ago</span>
                      </div>
                      <h2 className="text-h2 font-bold text-white mb-3">{activeCourse.title}</h2>
                      <p className="text-gray-400 text-body1 mb-8 line-clamp-2 max-w-2xl">{activeCourse.description}</p>
                      
                      <div className="max-w-xl">
                          <div className="flex justify-between text-caption1 mb-2 font-semibold text-gray-300">
                              <span>Course Progress</span>
                              <span>{getCourseProgress(currentUser!.id, activeCourse.id)}%</span>
                          </div>
                          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${getCourseProgress(currentUser!.id, activeCourse.id)}%` }}></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex-shrink-0">
                      <Link to={`/portal/course/${activeCourse.id}`}>
                        <Button size="lg" className="shadow-lg shadow-red-900/20">Continue Learning</Button>
                      </Link>
                  </div>
              </div>
          </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 border-l-4 border-l-blue-500 bg-blue-950/5 hover:bg-blue-950/10 transition-colors">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-500/20 rounded-xl text-blue-400">
              <Icons.BookOpen className="h-8 w-8" />
            </div>
            <div>
              <p className="text-caption1 font-medium text-blue-200/70 uppercase tracking-wider">Enrolled Courses</p>
              <p className="text-h2 font-archivo text-white mt-1">{enrolledCourses.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-8 border-l-4 border-l-red-500 bg-red-950/5 hover:bg-red-950/10 transition-colors">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-red-500/20 rounded-xl text-red-400">
              <Icons.Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-caption1 font-medium text-red-200/70 uppercase tracking-wider">Completed</p>
              <p className="text-h2 font-archivo text-white mt-1">{enrollments.filter(e => e.userId === currentUser?.id && e.status === 'completed').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-8 border-l-4 border-l-emerald-500 bg-emerald-950/5 hover:bg-emerald-950/10 transition-colors">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Icons.Award className="h-8 w-8" />
            </div>
            <div>
              <p className="text-caption1 font-medium text-emerald-200/70 uppercase tracking-wider">Certifications</p>
              <p className="text-h2 font-archivo text-white mt-1">0</p>
            </div>
          </div>
        </Card>
      </div>

      {enrolledCourses.length > 0 && (
        <div>
            <h2 className="text-h3 font-archivo mb-6 flex items-center gap-3">
                <Icons.BookOpen className="h-6 w-6 text-red-500" />
                My Training
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map(course => {
                const progress = getCourseProgress(currentUser!.id, course.id);
                return (
                    <Link key={course.id} to={`/portal/course/${course.id}`} className="group h-full">
                    <Card className="overflow-hidden hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-900/10 transition-all h-full flex flex-col bg-[#111827]">
                        <div className="relative h-56 w-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-10" />
                            <img src={course.image} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <Badge className="absolute top-4 right-4 z-20 backdrop-blur-md bg-black/60 border-white/10 text-white px-3 py-1">{course.level}</Badge>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-archivo text-h5 mb-3 text-white group-hover:text-red-400 transition-colors line-clamp-1">{course.title}</h3>
                            <p className="text-body2 text-gray-400 mb-8 line-clamp-2 leading-relaxed">{course.description}</p>
                            
                            <div className="space-y-4 mt-auto">
                                <div className="flex justify-between text-caption1 font-bold text-gray-300 uppercase tracking-wide">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }}></div>
                                </div>
                                <Button variant="outline" size="lg" className="w-full mt-4 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                                    {progress === 100 ? 'Review Course' : 'Continue Training'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                    </Link>
                );
            })}
            </div>
        </div>
      )}

      {availableCourses.length > 0 && (
         <div>
            <h2 className="text-h3 font-archivo mb-6 flex items-center gap-3">
                <Icons.Plus className="h-6 w-6 text-gray-400" />
                Available Courses
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableCourses.map(course => (
                     <Card key={course.id} className="overflow-hidden border-dashed border-2 border-white/10 hover:border-red-500/30 hover:bg-[#111827] transition-all group flex flex-col bg-transparent">
                        <div className="relative h-48 w-full overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
                            <img src={course.image} alt={course.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-archivo text-h5 mb-3 text-white group-hover:text-red-400 transition-colors">{course.title}</h3>
                            <p className="text-body2 text-gray-500 group-hover:text-gray-400 line-clamp-2 mb-8 leading-relaxed">{course.description}</p>
                            <div className="mt-auto">
                                <Button onClick={() => handleEnroll(course.id, course.title)} variant="ghost" size="lg" className="w-full border border-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white group-hover:bg-white/5">
                                    Enroll Now
                                </Button>
                            </div>
                        </div>
                     </Card>
                ))}
            </div>
         </div>
      )}
    </div>
  );
};

// --- Protected Route Wrapper ---
// Fix: Make children optional to resolve TS error
const ProtectedRoute = ({ children, role }: { children?: React.ReactNode; role: 'admin' | 'user' }) => {
  const { currentUser } = useData();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'} replace />;
  }

  return <>{children}</>;
};

// --- Placeholder Components for missing routes ---
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-h2 font-archivo text-white mb-4">{title}</h1>
    <p className="text-gray-400">This module is currently under development.</p>
  </div>
);

const CoursePlayer = () => <PlaceholderPage title="Course Player" />;
const StudentCertifications = () => <PlaceholderPage title="Certifications" />;
const StudentTraining = () => <PlaceholderPage title="My Training" />;

const AdminDashboard = () => <PlaceholderPage title="Admin Overview" />;
const AdminCourses = () => <PlaceholderPage title="Training Modules Management" />;
const AdminUsers = () => <PlaceholderPage title="User Management" />;
const AdminSettings = () => <PlaceholderPage title="System Settings" />;

// --- Main App Component ---
const App = () => {
  return (
    <DataProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          
          {/* Student Portal */}
          <Route path="/portal/*" element={
            <ProtectedRoute role="user">
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentTraining />} />
                  <Route path="certifications" element={<StudentCertifications />} />
                  <Route path="course/:courseId" element={<CoursePlayer />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Portal */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DataProvider>
  );
};

export default App;
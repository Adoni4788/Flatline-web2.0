import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Textarea, Card, Badge, Icons, Modal, Select, Toast, BarChart } from './components/ui';
import { DataProvider, useData } from './lib/context';
import { User, Course, Lesson, Module } from './lib/types';
import { PresentationLessonContent, PresentationSourceType, parsePresentationLessonContent, serializePresentationLessonContent } from './lib/presentations';
import { supabase } from './lib/supabase';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="h-16 w-16 bg-red-900/30 border border-red-500/30 flex items-center justify-center mx-auto rounded-full">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold font-archivo text-white">Something went wrong</h1>
            <p className="text-gray-400">An unexpected error occurred. Please refresh the page to try again.</p>
            <button
              type="button"
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; action?: { label: string; onClick: () => void } } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', action?: { label: string; onClick: () => void }) => {
    setToast({ message, type, action });
  };
  const closeToast = () => setToast(null);
  return { toast, showToast, closeToast };
};

const PRESENTATION_FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const createEmptyPresentation = (): PresentationLessonContent => ({
  kind: 'presentation_v1',
  sourceType: 'embed',
  embedUrl: '',
  fileName: '',
  fileDataUrl: '',
  mimeType: ''
});

const getLessonPresentation = (lesson?: Lesson | null): PresentationLessonContent | null => {
  return parsePresentationLessonContent(lesson?.content);
};

// --- Preview Banner Component ---
const PreviewBanner = () => {
  return null; // Placeholder - can be customized later
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
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? 'border-b border-white/10 bg-[#030712]/90 backdrop-blur-md py-4'
          : 'border-b border-transparent bg-transparent py-8'
          }`}
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 font-archivo text-white group relative z-10">
            <img
              src="/images/flatline-svg-logo.svg"
              alt="Flatline Security Logo"
              className="h-14 w-14 md:h-16 md:w-16 object-contain"
            />
            <div className="h-8 md:h-10 w-px bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-h5 font-semibold tracking-normal leading-none">FLATLINE<span className="text-red-500">SECURITY</span></span>
              <span className="text-[10px] md:text-xs text-gray-400 font-normal tracking-wide uppercase">AND TRAINING SOLUTIONS LIMITED</span>
            </div>
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
              {[
                { name: 'Facebook', icon: Icons.Facebook, url: '#' },
                { name: 'Instagram', icon: Icons.Instagram, url: '#' },
                { name: 'LinkedIn', icon: Icons.LinkedIn, url: '#' },
                { name: 'Twitter', icon: Icons.Twitter, url: '#' }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all cursor-pointer border border-white/5 hover:border-red-500"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
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
                <span>Discovery Bay, St Ann, Jamaica</span>
              </li>
              <li className="flex items-center gap-3">
                <Icons.Phone className="h-5 w-5 text-red-600 shrink-0" />
                <span>876 298 2262 / 876 593 7721</span>
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
  const { currentUser, logout, updateUser } = useData();
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast, showToast, closeToast } = useNotification();

  useEffect(() => {
    // Check initial banner state
    const dismissed = localStorage.getItem('preview_banner_dismissed');
    setBannerVisible(dismissed !== 'true');

    // Listen for banner close event
    const handleBannerClose = () => {
      setBannerVisible(false);
    };
    window.addEventListener('previewBannerClosed', handleBannerClose);
    return () => window.removeEventListener('previewBannerClosed', handleBannerClose);
  }, []);

  const handleEditProfile = async () => {
    setProfileError(null);
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      setProfileError('All fields are required');
      return;
    }
    if (!profileForm.email.includes('@')) {
      setProfileError('Please enter a valid email address');
      return;
    }
    if (currentUser) {
      try {
        await updateUser(currentUser.id, {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email
        });
        showToast('Profile updated successfully', 'success');
        setShowEditProfileModal(false);
      } catch {
        setProfileError('Failed to update profile. Please try again.');
      }
    }
  };

  const openEditProfileModal = () => {
    if (currentUser) {
      setProfileForm({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      });
      setProfileError(null);
      setShowUserModal(false);
      setShowEditProfileModal(true);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.current === passwordForm.new) {
      setPasswordError('New password must be different from current password');
      return;
    }
    if (!currentUser?.email) {
      setPasswordError('Session expired. Please sign in again.');
      return;
    }
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordForm.current,
      });
      if (reauthError) {
        setPasswordError('Current password is incorrect');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      showToast('Password changed successfully', 'success');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    }
  };

  const navItems = [
    { icon: Icons.LayoutDashboard, label: 'Dashboard', path: '/portal/dashboard' },
    { icon: Icons.BookOpen, label: 'My Training', path: '/portal/courses' },
    { icon: Icons.Video, label: 'Live Sessions', path: '/portal/live-sessions' },
    { icon: Icons.Clipboard, label: 'Exams', path: '/portal/exams' },
    { icon: Icons.Award, label: 'Certifications', path: '/portal/certifications' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
          <Icons.Shield className="h-4 w-4 text-white" />
        </div>
        <span className="font-archivo tracking-tight text-h6 font-medium text-white">Student Portal</span>
      </div>
      <div className="mx-6 border-b border-white/5"></div>
      <div className="flex-1 overflow-y-auto py-6 px-0 space-y-0">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-6 py-3 mx-4 text-subtitle2 font-archivo transition-all border-l-4 ${location.pathname.startsWith(item.path)
              ? 'bg-red-500/10 text-red-400 border-l-red-500'
              : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-transparent'
              }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mx-6 border-t border-white/5"></div>
      <div className="p-4 pt-4">
        <button
          onClick={() => setShowUserModal(true)}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-none bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center text-caption1 text-white shadow-inner">
            {currentUser?.firstName[0]}{currentUser?.lastName[0]}
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="truncate text-subtitle2 font-medium text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
            <p className="truncate text-caption text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Active Trainee
            </p>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#02040a] text-gray-100 font-sans">
      <PreviewBanner />
      {/* Desktop Sidebar */}
      <aside className={`hidden flex-col border-r border-white/5 bg-[#030712] md:flex sticky top-0 h-screen z-40 shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 h-full bg-[#030712] border-r border-white/10 flex flex-col shadow-2xl animate-fade-in">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Command Center Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#050914] to-[#030712] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/5 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-full h-96 bg-red-900/5 blur-[120px] pointer-events-none z-0"></div>

        {/* Hamburger Menu Button - Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`hidden md:flex fixed top-4 z-50 h-8 w-8 items-center justify-center rounded-full bg-[#030712] border-2 border-red-600/50 hover:border-red-600 hover:bg-red-600/10 transition-all duration-300 shadow-lg shadow-red-900/20 ${isSidebarOpen ? 'left-[270px] rotate-0' : 'left-12 rotate-180'
            }`}
          style={{ marginTop: bannerVisible ? '34px' : '0' }}
          aria-label="Toggle sidebar"
        >
          <Icons.Menu className="h-4 w-4 text-red-600" />
        </button>

        <header className={`md:hidden flex h-16 items-center justify-between border-b border-white/10 px-4 bg-[#030712]/90 backdrop-blur-md sticky ${bannerVisible ? 'top-[34px]' : 'top-0'} z-30 relative transition-all duration-300`}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
              <Icons.Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-archivo font-medium">Student Portal</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}><Icons.Menu className="h-5 w-5" /></Button>
        </header>
        <div className="flex-1 p-6 md:p-12 overflow-y-auto pb-20 relative z-10">
          {children}
        </div>
      </main>

      {/* User Profile Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-start md:justify-end p-4" onClick={() => setShowUserModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm md:mt-20 md:mr-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center text-h6 text-white shadow-lg">
                  {currentUser?.firstName[0]}{currentUser?.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-subtitle1 font-medium text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-caption text-gray-400">{currentUser?.email}</p>
                  <p className="text-caption text-green-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Active Trainee
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-1">
                <Button
                  variant="ghost"
                  onClick={openEditProfileModal}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
                >
                  <Icons.Edit className="mr-3 h-5 w-5" />
                  Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setShowUserModal(false); setShowPasswordModal(true); }}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
                >
                  <Icons.Lock className="mr-3 h-5 w-5" />
                  Change Password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setShowUserModal(false); logout(); }}
                  className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-none"
                >
                  <Icons.LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowEditProfileModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h5 font-archivo font-bold text-white">Edit Profile</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Icons.X className="h-5 w-5" />
                </Button>
              </div>

              {profileError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {profileError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">First Name</label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      placeholder="First name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      placeholder="Last name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Email address"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditProfile}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h5 font-archivo font-bold text-white">Change Password</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Icons.X className="h-5 w-5" />
                </Button>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Enter new password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ current: '', new: '', confirm: '' });
                    setPasswordError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                  className="flex-1"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}
    </div>
  );
};

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser, logout } = useData();
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast, showToast, closeToast } = useNotification();

  useEffect(() => {
    // Check initial banner state
    const dismissed = localStorage.getItem('preview_banner_dismissed');
    setBannerVisible(dismissed !== 'true');

    // Listen for banner close event
    const handleBannerClose = () => {
      setBannerVisible(false);
    };
    window.addEventListener('previewBannerClosed', handleBannerClose);
    return () => window.removeEventListener('previewBannerClosed', handleBannerClose);
  }, []);

  const handlePasswordChange = async () => {
    setPasswordError(null);
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser?.email || '',
        password: passwordForm.current,
      });

      if (signInError) {
        setPasswordError('Current password is incorrect');
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new,
      });

      if (updateError) throw updateError;

      showToast('Password changed successfully', 'success');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {

      setPasswordError(error.message || 'Failed to change password');
    }
  };

  const navItems = [
    { icon: Icons.LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Icons.BookOpen, label: 'Training Modules', path: '/admin/courses' },
    { icon: Icons.Users, label: 'Trainees', path: '/admin/users' },
    { icon: Icons.Video, label: 'Live Sessions', path: '/admin/live-sessions' },
    { icon: Icons.Clipboard, label: 'Exams', path: '/admin/exams' },
    { icon: Icons.Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
          <Icons.Shield className="h-4 w-4 text-white" />
        </div>
        <span className="font-archivo tracking-tight text-white text-h6 font-medium">Admin Console</span>
      </div>
      <div className="mx-6 border-b border-white/5"></div>
      <div className="flex-1 overflow-y-auto py-6 px-0 space-y-0">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-6 py-3 mx-4 text-subtitle2 font-archivo transition-all border-l-4 ${location.pathname.startsWith(item.path)
              ? 'bg-red-500/10 text-red-400 border-l-red-500'
              : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-transparent'
              }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mx-6 border-t border-white/5"></div>
      <div className="p-4 pt-4">
        <button
          onClick={() => setShowUserModal(true)}
          className="flex items-center gap-3 w-full px-2 py-2 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center text-caption1 text-white shadow-inner">
            A
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="truncate text-subtitle2 font-medium text-white">Administrator</p>
            <p className="truncate text-caption text-gray-400">System Control</p>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#030712] text-gray-100">
      <PreviewBanner />
      {/* Desktop Sidebar */}
      <aside className={`hidden flex-col border-r border-white/5 bg-[#030712] md:flex sticky top-0 h-screen z-40 shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 h-full bg-[#030712] border-r border-white/5 flex flex-col shadow-2xl animate-fade-in">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Admin Command Center Background */}
        <div className="absolute inset-0 bg-[#030712] z-0"></div>

        {/* Hamburger Menu Button - Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`hidden md:flex fixed top-4 z-50 h-8 w-8 items-center justify-center rounded-full bg-[#030712] border-2 border-red-600/50 hover:border-red-600 hover:bg-red-600/10 transition-all duration-300 shadow-lg shadow-red-900/20 ${isSidebarOpen ? 'left-[270px] rotate-0' : 'left-12 rotate-180'
            }`}
          style={{ marginTop: bannerVisible ? '34px' : '0' }}
          aria-label="Toggle sidebar"
        >
          <Icons.Menu className="h-4 w-4 text-red-600" />
        </button>

        <header className={`md:hidden flex h-16 items-center justify-between border-b border-white/5 px-4 bg-[#030712] sticky ${bannerVisible ? 'top-[34px]' : 'top-0'} z-30 relative transition-all duration-300`}>
          <span className="font-bold text-white font-archivo text-h6">Admin Console</span>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(true)}><Icons.Menu className="h-5 w-5" /></Button>
        </header>
        <div className={`flex-1 p-6 md:p-12 overflow-y-auto pb-20 relative z-10 ${!isSidebarOpen ? 'md:pl-24' : ''}`}>
          {children}
        </div>
      </main>

      {/* Admin User Profile Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-start md:justify-end p-4" onClick={() => setShowUserModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-sm md:mt-20 md:mr-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center text-h6 text-white shadow-lg">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-subtitle1 font-medium text-white">Administrator</p>
                  <p className="text-caption text-gray-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                    System Control
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => { setShowUserModal(false); setShowPasswordModal(true); }}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
                >
                  <Icons.Lock className="mr-3 h-5 w-5" />
                  Change Password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setShowUserModal(false); logout(); }}
                  className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-none"
                >
                  <Icons.LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#111827] border border-white/10 rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-h5 font-archivo font-bold text-white">Change Password</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Icons.X className="h-5 w-5" />
                </Button>
              </div>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.current ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Enter new password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.new ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="bg-white/5 border-white/10 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPasswords.confirm ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ current: '', new: '', confirm: '' });
                    setPasswordError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                  className="flex-1"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}
    </div>
  );
};

// --- Pages ---

const LandingPage = () => {
  const galleryItems = [
    {
      title: "Tactical Response",
      category: "Advanced",
      img: "/images/fst-tactical-image.png",
      className: "md:col-span-2 md:row-span-2"
    },
    {
      title: "Range Safety",
      category: "Fundamentals",
      img: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600&h=400&fit=crop",
      className: "md:col-span-1 md:row-span-1"
    },
    {
      title: "Cyber Warfare",
      category: "Intelligence",
      img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=800&fit=crop",
      className: "md:col-span-1 md:row-span-2"
    },
    {
      title: "Team Briefing",
      category: "Leadership",
      img: "/images/fst-securityimg.png",
      className: "md:col-span-1 md:row-span-1"
    }
  ];

  return (
    <div className="space-y-0 pb-0 bg-[#030712]">
      {/* Hero Section - Elite Standard */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1551817958-c9c450974b7c?q=80&w=2070&auto=format&fit=crop"
            alt="Security Background"
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-[#030712]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />

          {/* Shield Background Element */}
          <img
            src="/images/hero-image-shield.png"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[500px] lg:w-[600px] pointer-events-none animate-pulse-slow"
          />
        </div>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 text-center mt-8">
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
            <span className="block text-xl md:text-2xl lg:text-3xl font-light tracking-widest text-gray-400 mt-4 uppercase">
              and Training Solutions Limited
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
                  src="/images/professional corporate-amage.png"
                  alt="Professional Flatline Security Team"
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
              { icon: Icons.Phone, title: "Call Us", line1: "876 298 2262", line2: "876 593 7721" },
              { icon: Icons.Mail, title: "Email Us", line1: "info@fstsolutionsltd.com", line2: "24/7 Support" },
              { icon: Icons.MapPin, title: "Visit Us", line1: "Discovery Bay, St Ann", line2: "Jamaica" }
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
              <h2 className="text-4xl md:text-6xl font-bold font-archivo text-white mb-6 tracking-tight">Ready to Elevate Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Security Standards?</span></h2>
              <p className="text-xl text-gray-400 font-light mb-12">Join elite professionals and secure your future with our world-class training programs.</p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/login">
                  <Button size="lg" className="h-16 px-12 text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-shadow rounded-none">
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="h-16 px-12 text-lg uppercase tracking-widest border-white/20 hover:bg-white/5 hover:border-white text-white rounded-none">
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
              <img src="/images/flatline-team-origins.png" className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Flatline Security Leadership Team - Origins of Excellence" />
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
            { name: "Major Alan Dutch", role: "Head Instructor", bio: "Former Special Forces operative with 20 years of field experience in counter-terrorism.", img: "/images/instructor-alan-dutch.png" },
            { name: "Sarah Connor", role: "Tactical Evasion", bio: "Specialist in defensive driving and urban evasion tactics for high-risk assets.", img: "/images/instructor-sarah-connor.png" },
            { name: "John Matrix", role: "CQC Expert", bio: "Master of close-quarters combat and hand-to-hand defense techniques.", img: "/images/instructor-john-matrix.png" }
          ].map((inst, i) => (
            <div key={i} className="group relative bg-[#0a0f1c] border border-white/5 overflow-hidden hover:border-red-500/30 transition-all duration-500">
              <div className="h-96 overflow-hidden relative">
                <img
                  src={inst.img}
                  alt={inst.name}
                  className={`w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 ${inst.name === "Major Alan Dutch" || inst.name === "John Matrix"
                    ? "object-cover object-top"
                    : "object-cover"
                    }`}
                />
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
            <Button size="lg" className="h-16 px-12 text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-shadow rounded-none">
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
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0">
          <img
            src="/images/service-image-fst.png"
            alt="Services Background"
            className="w-full h-full object-cover grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/50 to-[#030712]"></div>
        </div>
        <div className="relative z-10 text-center px-4 mt-8">
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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setStatus('sending');

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: form,
      });

      if (error) throw error;

      setStatus('success');
      setForm({ firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {

      setStatus('error');
      setErrorMsg('Transmission failed. Please try again or contact us directly.');
    }
  };

  return (
    <div className="bg-[#030712]">
      {/* Cinematic Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
            alt="Contact Background"
            className="w-full h-full object-cover grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#030712]/50 to-[#030712]"></div>
        </div>
        <div className="relative z-10 text-center px-4 mt-8">
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
                  { icon: Icons.MapPin, title: "Headquarters", lines: ["123 Security Blvd, Discovery Bay", "St Ann, Jamaica"] },
                  { icon: Icons.Mail, title: "Electronic Mail", lines: ["info@fstsolutionsltd.com", "support@flatline.com"] },
                  { icon: Icons.Phone, title: "Operations Center", lines: ["876 298 2262", "876 593 7721"] }
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

              {status === 'success' ? (
                <div className="text-center py-16 space-y-4">
                  <div className="h-16 w-16 bg-green-900/30 border border-green-500/30 flex items-center justify-center mx-auto">
                    <Icons.Check className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold font-archivo text-white">Transmission Sent</h4>
                  <p className="text-gray-400 font-light">We've received your message and will respond within 1–2 business days. Check your inbox for a confirmation.</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-sm text-red-500 hover:text-red-400 underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">First Name</label>
                      <Input
                        placeholder="John"
                        className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none"
                        value={form.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        disabled={status === 'sending'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Name</label>
                      <Input
                        placeholder="Doe"
                        className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none"
                        value={form.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        disabled={status === 'sending'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={status === 'sending'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subject</label>
                    <Select
                      className="bg-black/40 border-gray-800 focus:border-red-600 h-14 rounded-none text-gray-300"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      disabled={status === 'sending'}
                    >
                      <option>General Inquiry</option>
                      <option>Course Enrollment</option>
                      <option>Security Services</option>
                      <option>Corporate Consultation</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Message</label>
                    <Textarea
                      placeholder="Secure transmission content..."
                      className="bg-black/40 border-gray-800 focus:border-red-600 h-40 rounded-none p-4"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      disabled={status === 'sending'}
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-400 text-sm border border-red-900/50 bg-red-900/10 px-4 py-3">{errorMsg}</p>
                  )}

                  <Button
                    size="lg"
                    className="w-full h-16 font-bold text-lg uppercase tracking-widest bg-red-600 hover:bg-red-700 rounded-none shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Transmitting...' : 'Transmit Message'}
                  </Button>
                </form>
              )}
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login, currentUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const loginError = await login(email, password);
    if (loginError) {
      setIsLoading(false);
      setError(loginError);
      return;
    }
    const stored = localStorage.getItem('flatline_user');
    const user = stored ? JSON.parse(stored) : null;
    navigate(user?.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full animate-pulse"></div>

      <Card className="w-full max-w-md p-6 sm:p-8 relative z-10 border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/50">
            <Icons.Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-h3 font-archivo tracking-tight text-white">Welcome Back</h1>
          <p className="text-body2 text-gray-400 mt-2">Sign in to access your secure training portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-caption1 font-medium text-gray-300 ml-1">Email Address</label>
            <Input
              type="email"
              placeholder="user@flatline.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-11 rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-caption1 font-medium text-gray-300 ml-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="h-11 rounded-none"
            />
          </div>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-caption1 font-medium text-center">{error}</div>}
          <Button type="submit" size="lg" className="w-full h-11 shadow-lg shadow-red-900/20" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Icons.Info className="h-4 w-4" />
            <span className="text-caption1">Don't have an account?</span>
          </div>
          <p className="text-caption text-gray-500 max-w-xs mx-auto">
            Contact your administrator to request access credentials for the training portal.
          </p>
        </div>
      </Card>
    </div>
  );
};

// --- Student Pages ---

const StudentDashboard = () => {
  const { currentUser, courses, enrollments, getCourseProgress } = useData();
  const { toast, closeToast } = useNotification();

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.userId === currentUser?.id && e.courseId === c.id));

  const activeCourse = enrolledCourses.find(c => {
    const p = getCourseProgress(currentUser!.id, c.id);
    return p > 0 && p < 100;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}

      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-h2 font-archivo font-medium text-white tracking-wide">Command Center</h1>
          <p className="text-gray-400 mt-1 text-body1 font-light">Welcome back, {currentUser?.firstName}. Ready for deployment.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-caption1 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Status: Active
          </div>
        </div>
      </div>

      {/* Hero: Continue Learning */}
      {activeCourse && (
        <div className="relative overflow-hidden border border-white/10 bg-[#0a0f1c]/80 p-0 shadow-2xl group transition-all duration-500 hover:border-red-500/30">
          {/* Background with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img src={activeCourse.image} alt="Background" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c] via-[#0a0f1c]/90 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 p-10">
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="relative h-48 w-72 rounded-sm overflow-hidden border border-white/10 shadow-2xl group-hover:border-red-500/40 transition-colors duration-500">
                <img src={activeCourse.image} alt={activeCourse.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-12 w-12 border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Icons.Play className="h-5 w-5 text-white fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="text-red-500 font-bold font-archivo tracking-widest uppercase text-xs">Priority Task</span>
                <div className="h-px w-10 bg-red-900/50"></div>
              </div>
              <h2 className="text-3xl font-archivo font-medium text-white mb-2">{activeCourse.title}</h2>
              <p className="text-gray-400 text-body1 mb-8 line-clamp-2 max-w-2xl font-light">{activeCourse.description}</p>

              <div className="max-w-xl">
                <div className="flex justify-between text-caption1 mb-2 font-bold text-gray-500 uppercase tracking-widest">
                  <span>Mission Progress</span>
                  <span className="text-white">{getCourseProgress(currentUser!.id, activeCourse.id)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-none overflow-hidden">
                  <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${getCourseProgress(currentUser!.id, activeCourse.id)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link to={`/portal/course/${activeCourse.id}`}>
                <Button size="lg" className="rounded-none h-14 px-8 text-lg uppercase tracking-widest bg-red-600 hover:bg-red-700 border border-transparent hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
                  Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-white/5 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-white/10 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Enrolled Modules</p>
            <p className="text-3xl font-archivo text-white">{enrolledCourses.length}</p>
          </div>
          <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
            <Icons.BookOpen className="h-5 w-5" />
          </div>
        </div>
        <div className="p-6 border border-white/5 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-white/10 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-archivo text-white">{enrollments.filter(e => e.userId === currentUser?.id && e.status === 'completed').length}</p>
          </div>
          <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
            <Icons.Check className="h-5 w-5" />
          </div>
        </div>
        <div className="p-6 border border-white/5 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-white/10 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Certifications</p>
            <p className="text-3xl font-archivo text-white">{enrollments.filter(e => e.userId === currentUser?.id && e.status === 'completed' && e.completedLessons?.length > 0).length}</p>
          </div>
          <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
            <Icons.Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {enrolledCourses.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-6 bg-red-600"></span>
            <h2 className="text-lg font-archivo font-bold text-white uppercase tracking-widest">Active Training</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => {
              const progress = getCourseProgress(currentUser!.id, course.id);
              return (
                <Link key={course.id} to={`/portal/course/${course.id}`} className="group h-full">
                  <div className="bg-[#0f121a] border border-white/5 hover:border-red-500/30 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                    <div className="relative h-48 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f121a] to-transparent z-10" />
                      <img src={course.image} alt={course.title} className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                      <Badge className="absolute top-4 right-4 z-20 bg-black/80 border-white/10 text-white rounded-none text-xs uppercase tracking-widest px-2 py-1">{course.level}</Badge>
                    </div>
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <h3 className="font-archivo text-xl font-medium mb-2 text-white group-hover:text-red-400 transition-colors line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{course.description}</p>

                      <div className="space-y-3 mt-auto">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-800 overflow-hidden">
                          <div className="h-full bg-red-600" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {enrolledCourses.length === 0 && (
        <div className="border border-white/5 bg-[#0f121a] p-12 text-center">
          <h2 className="text-lg font-archivo font-bold text-gray-300 uppercase tracking-widest mb-3">No Training Assigned</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            You have not been assigned any training yet. Please contact your administrator to be enrolled in a course.
          </p>
        </div>
      )}

      {/* Certificates Section */}
      {enrollments.filter(e => e.userId === currentUser?.id && e.status === 'completed').length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6 mt-12">
            <span className="h-px w-6 bg-amber-600"></span>
            <h2 className="text-lg font-archivo font-bold text-amber-400 uppercase tracking-widest">Earned Certificates</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments
              .filter(e => e.userId === currentUser?.id && e.status === 'completed')
              .map(enrollment => {
                const course = courses.find(c => c.id === enrollment.courseId);
                if (!course) return null;
                return (
                  <div
                    key={enrollment.id}
                    className="relative border-2 border-amber-900/30 bg-gradient-to-br from-[#0f121a] via-[#1a1a2e] to-[#0f121a] p-8 group hover:border-amber-500/50 transition-all duration-300"
                  >
                    {/* Certificate decorative corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/40"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/40"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40"></div>

                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg shadow-amber-900/30">
                          <Icons.Award className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-amber-500/70 uppercase tracking-[0.3em] mb-2">Certificate of Completion</p>
                        <h3 className="text-xl font-archivo font-medium text-white mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.level} Level • {course.duration} minutes</p>
                      </div>

                      <div className="pt-4 border-t border-amber-900/20">
                        <p className="text-sm text-gray-400">Awarded to</p>
                        <p className="text-lg text-white font-archivo">{currentUser?.firstName} {currentUser?.lastName}</p>
                      </div>

                      <div className="flex justify-center gap-2 pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 border border-amber-900/30"
                          onClick={() => {
                            // Generate a simple certificate for print/download
                            const certWindow = window.open('', '_blank');
                            if (certWindow) {
                              certWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>Certificate - ${course.title}</title>
                                  <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&display=swap');
                                    body {
                                      font-family: 'Archivo', sans-serif;
                                      background: linear-gradient(135deg, #0f121a 0%, #1a1a2e 50%, #0f121a 100%);
                                      min-height: 100vh;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      padding: 40px;
                                      box-sizing: border-box;
                                    }
                                    .certificate {
                                      background: #0a0f1c;
                                      border: 3px solid #d97706;
                                      padding: 60px 80px;
                                      max-width: 800px;
                                      text-align: center;
                                      position: relative;
                                    }
                                    .certificate::before,
                                    .certificate::after {
                                      content: '';
                                      position: absolute;
                                      width: 60px;
                                      height: 60px;
                                      border-color: #d97706;
                                    }
                                    .certificate::before {
                                      top: 15px; left: 15px;
                                      border-top: 2px solid; border-left: 2px solid;
                                    }
                                    .certificate::after {
                                      bottom: 15px; right: 15px;
                                      border-bottom: 2px solid; border-right: 2px solid;
                                    }
                                    .header { color: #d97706; font-size: 14px; letter-spacing: 8px; text-transform: uppercase; margin-bottom: 20px; }
                                    .title { color: white; font-size: 36px; font-weight: 500; margin-bottom: 10px; }
                                    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 40px; }
                                    .name-section { margin: 40px 0; }
                                    .name-label { color: #9ca3af; font-size: 12px; }
                                    .name { color: white; font-size: 28px; font-weight: 500; border-bottom: 1px solid #374151; padding-bottom: 10px; display: inline-block; min-width: 300px; }
                                    .footer { color: #6b7280; font-size: 12px; margin-top: 40px; }
                                    .logo { color: white; font-size: 18px; font-weight: 700; margin-top: 20px; }
                                    .logo span { color: #ef4444; }
                                  </style>
                                </head>
                                <body>
                                  <div class="certificate">
                                    <div class="header">Certificate of Completion</div>
                                    <div class="title">${course.title}</div>
                                    <div class="subtitle">${course.level} Level • ${course.duration} Minutes</div>
                                    <div class="name-section">
                                      <div class="name-label">This is to certify that</div>
                                      <div class="name">${currentUser?.firstName} ${currentUser?.lastName}</div>
                                    </div>
                                    <div class="footer">has successfully completed all requirements for this training course</div>
                                    <div class="logo">FLATLINE<span>SECURITY</span></div>
                                  </div>
                                  <script>window.print();</script>
                                </body>
                                </html>
                              `);
                              certWindow.document.close();
                            }
                          }}
                        >
                          <Icons.Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Protected Route Wrapper ---
// Rewritten to use useEffect instead of render-time Navigate to prevent infinite loops
const ProtectedRoute = ({ children, role }: { children?: React.ReactNode; role: 'admin' | 'user' }) => {
  const { currentUser, sessionChecked } = useData();
  const navigate = useNavigate();
  const hasNavigated = React.useRef(false);

  useEffect(() => {
    // Reset navigation flag when dependencies change
    hasNavigated.current = false;
  }, [currentUser, role]);

  useEffect(() => {
    // Don't redirect until we've checked localStorage
    if (!sessionChecked) return;

    // Prevent multiple navigations
    if (hasNavigated.current) return;

    // No user - redirect to login
    if (!currentUser) {
      hasNavigated.current = true;
      navigate('/login', { replace: true });
      return;
    }

    // Invalid role - redirect to login
    if (!currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'user')) {
      hasNavigated.current = true;
      navigate('/login', { replace: true });
      return;
    }

    // Wrong role - redirect to appropriate dashboard
    if (currentUser.role !== role) {
      hasNavigated.current = true;
      const targetPath = currentUser.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard';
      navigate(targetPath, { replace: true });
      return;
    }
  }, [currentUser, role, navigate, sessionChecked]);

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // No user or invalid role - show nothing while redirecting
  if (!currentUser || !currentUser.role || (currentUser.role !== 'admin' && currentUser.role !== 'user')) {
    return null;
  }

  // Wrong role - show nothing while redirecting
  if (currentUser.role !== role) {
    return null;
  }

  // Authorized - render children
  return <>{children}</>;
};


const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, modules, lessons, enrollments, currentUser, updateProgress, refreshEnrollments } = useData();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const course = courses.find(c => c.id === courseId);
  const courseModules = modules.filter(m => m.courseId === courseId).sort((a, b) => a.orderNumber - b.orderNumber);
  const enrollment = enrollments.find(e => e.userId === currentUser?.id && e.courseId === courseId);

  // Get all lessons for this course
  const courseLessons = courseModules.flatMap(module =>
    lessons.filter(l => l.moduleId === module.id).sort((a, b) => a.orderNumber - b.orderNumber)
  );

  // Set initial lesson
  useEffect(() => {
    if (courseLessons.length > 0 && !currentLessonId) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = courseLessons.find(l => !enrollment?.completedLessons.includes(l.id));
      setCurrentLessonId(firstIncomplete?.id || courseLessons[0].id);
    }
  }, [courseLessons, currentLessonId, enrollment]);

  if (!course || !courseId) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">Course Not Found</h1>
        <p className="text-gray-400 mb-6">This course does not exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/portal/courses')} variant="primary" className="rounded-none">Back to My Training</Button>
      </div>
    );
  }

  if (courseModules.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">{course.title}</h1>
        <p className="text-gray-400 mb-6">This course has no content available yet. Please check back later.</p>
        <Button onClick={() => navigate('/portal/dashboard')} variant="primary" className="rounded-none">Back to Dashboard</Button>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">{course.title}</h1>
        <p className="text-gray-400 mb-6">You are not enrolled in this course.</p>
        <Button onClick={() => navigate('/portal/courses')} variant="primary" className="rounded-none">Back to My Training</Button>
      </div>
    );
  }

  const currentLesson = lessons.find(l => l.id === currentLessonId);
  const currentModule = currentLesson ? modules.find(m => m.id === currentLesson.moduleId) : null;
  const currentLessonIndex = courseLessons.findIndex(l => l.id === currentLessonId);
  const isLessonComplete = enrollment?.completedLessons.includes(currentLessonId || '');
  const currentPresentation = getLessonPresentation(currentLesson);

  const handleMarkComplete = async () => {
    if (currentUser && currentLessonId && courseId) {
      try {
        await updateProgress(currentUser.id, currentLessonId, courseId);
        showToast('Lesson marked as complete!', 'success');

        // Auto-advance to next lesson
        const nextLesson = courseLessons[currentLessonIndex + 1];
        if (nextLesson) {
          setTimeout(() => {
            setCurrentLessonId(nextLesson.id);
            setQuizAnswers({});
            setQuizSubmitted(false);
          }, 500);
        }
      } catch (error) {
        showToast('Failed to update progress', 'error');
      }
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentLesson?.questions || !currentUser || !currentLessonId || !courseId) return;

    try {
      const { data, error } = await supabase.functions.invoke('score-lesson-quiz', {
        body: { lessonId: currentLessonId, courseId, answers: quizAnswers }
      });

      let errMsg: string | undefined = data?.error;
      if (!errMsg && error) {
        const ctx = (error as any).context;
        if (ctx instanceof Response) {
          try { const body = await ctx.clone().json(); errMsg = body?.error; }
          catch { try { errMsg = await ctx.clone().text(); } catch {} }
        } else if (ctx && typeof ctx === 'object') {
          errMsg = ctx.error;
        }
        if (!errMsg) errMsg = (error as any).message;
      }
      if (errMsg) {
        showToast(errMsg, 'error');
        return;
      }

      const percentage = Number(data?.score ?? 0);
      const passed = !!data?.passed;
      const passingScore = Number(data?.passingScore ?? currentLesson.passingScore ?? 70);
      setQuizScore(percentage);
      setQuizSubmitted(true);

      if (passed) {
        showToast(`Passed! Score: ${percentage}%`, 'success');
        await refreshEnrollments();
      } else {
        showToast(`Score: ${percentage}% - Passing score is ${passingScore}%`, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Unable to submit quiz', 'error');
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    setQuizAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const goToNextLesson = () => {
    const nextLesson = courseLessons[currentLessonIndex + 1];
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const goToPreviousLesson = () => {
    const prevLesson = courseLessons[currentLessonIndex - 1];
    if (prevLesson) {
      setCurrentLessonId(prevLesson.id);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      {/* Sidebar - Lesson Navigation */}
      <div className="w-80 border-r border-white/5 bg-[#02040a] flex flex-col overflow-hidden">
        <div className="pr-6 pt-6 pb-6 border-b border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/portal/dashboard')}
            className="mb-4 text-gray-400 hover:text-white rounded-none"
          >
            <Icons.ChevronRight className="h-4 w-4 rotate-180 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-h5 font-archivo text-white font-bold mb-2">{course.title}</h2>
          <div className="flex items-center gap-4 text-caption text-gray-400">
            <span>{courseModules.length} Modules</span>
            <span>•</span>
            <span>{courseLessons.length} Lessons</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-caption mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-medium">{enrollment?.progress || 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                style={{ width: `${enrollment?.progress || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {courseModules.map((module, moduleIndex) => {
            const moduleLessons = lessons.filter(l => l.moduleId === module.id).sort((a, b) => a.orderNumber - b.orderNumber);
            return (
              <div key={module.id} className="border-b border-white/5">
                <div className="pr-4 pt-4 pb-4 bg-white/[0.02]">
                  <div className="text-caption1 text-gray-500 mb-1">Module {moduleIndex + 1}</div>
                  <div className="text-subtitle2 font-archivo text-white">{module.title}</div>
                </div>
                <div>
                  {moduleLessons.map((lesson, lessonIndex) => {
                    const isComplete = enrollment?.completedLessons.includes(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLessonId(lesson.id);
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className={`w-full text-left pr-6 pt-3 pb-3 pl-0 border-l-4 transition-all ${isCurrent
                          ? 'bg-red-500/10 border-l-red-500 text-red-400'
                          : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {isComplete ? (
                            <Icons.Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${isCurrent ? 'border-red-500' : 'border-gray-600'
                              }`} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-subtitle2 font-archivo truncate">{lesson.title}</div>
                            <div className="text-caption text-gray-500">
                              {lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'presentation' ? 'Presentation' : 'Lesson'} {lessonIndex + 1}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-white/5 bg-[#02040a] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentModule && (
                <div className="text-caption text-gray-500 mb-1">{currentModule.title}</div>
              )}
              <h1 className="text-h4 font-archivo text-white font-bold">{currentLesson?.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className="text-gray-400 hover:text-white disabled:opacity-30 rounded-none"
              >
                <Icons.ChevronRight className="h-4 w-4 rotate-180" />
                Previous
              </Button>
              {(currentLesson?.type === 'content' || currentLesson?.type === 'presentation') && !isLessonComplete && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkComplete}
                  className="bg-green-600 hover:bg-green-700 border-green-500 rounded-none"
                >
                  <Icons.Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextLesson}
                disabled={currentLessonIndex === courseLessons.length - 1}
                className="text-gray-400 hover:text-white disabled:opacity-30 rounded-none"
              >
                Next
                <Icons.ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {currentLesson?.type === 'content' ? (
              <div className="prose prose-invert prose-lg max-w-none">
                <div
                  className="text-gray-300 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>No content available.</p>' }}
                />
              </div>
            ) : currentLesson?.type === 'presentation' ? (
              <div className="space-y-6">
                <div className="border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="text-caption1 text-gray-500 uppercase tracking-widest mb-2">Presentation Lesson</div>
                      <h3 className="text-h5 font-archivo text-white">View the training presentation below</h3>
                    </div>
                    <Badge className="rounded-none bg-white/5 border-white/10 text-white">
                      {currentPresentation?.sourceType === 'upload' ? 'PDF Upload' : 'Embedded Link'}
                    </Badge>
                  </div>

                  {currentPresentation?.sourceType === 'embed' && currentPresentation.embedUrl ? (
                    <div className="space-y-4">
                      <div className="border border-white/10 bg-black/30 overflow-hidden">
                        <iframe
                          src={currentPresentation.embedUrl}
                          title={currentLesson.title}
                          className="w-full min-h-[70vh] bg-[#02040a]"
                          allow="fullscreen"
                        />
                      </div>
                      <div className="flex justify-end">
                        <a
                          href={currentPresentation.embedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                        >
                          Open in New Tab
                          <Icons.ChevronRight className="h-4 w-4 ml-2" />
                        </a>
                      </div>
                    </div>
                  ) : currentPresentation?.sourceType === 'upload' && currentPresentation.fileDataUrl ? (
                    <div className="space-y-4">
                      <div className="border border-white/10 bg-black/30 overflow-hidden">
                        <iframe
                          src={currentPresentation.fileDataUrl}
                          title={currentPresentation.fileName || currentLesson.title}
                          className="w-full min-h-[70vh] bg-[#02040a]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
                        <span className="truncate">{currentPresentation.fileName || 'Presentation file'}</span>
                        <a
                          href={currentPresentation.fileDataUrl}
                          download={currentPresentation.fileName || 'presentation.pdf'}
                          className="inline-flex items-center px-4 py-2 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                        >
                          Download PDF
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-amber-500/20 bg-amber-500/10 p-6 text-amber-100">
                      This presentation is not configured correctly yet. Please contact the administrator.
                    </div>
                  )}
                </div>
              </div>
            ) : currentLesson?.type === 'quiz' ? (
              <div className="space-y-6">
                {!quizSubmitted ? (
                  <>
                    {/* Quiz Header */}
                    <div className="border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-transparent p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icons.Award className="h-6 w-6 text-yellow-400" />
                        <h3 className="text-h5 font-archivo text-white font-bold">Quiz Assessment</h3>
                      </div>
                      <p className="text-body1 text-gray-300 ml-9">
                        Answer all questions below. Passing score: <span className="font-bold text-yellow-400">{currentLesson.passingScore || 70}%</span>
                      </p>
                    </div>

                    {/* Questions */}
                    {currentLesson.questions?.map((question, qIndex) => (
                      <div key={question.id} className="border border-white/10 bg-white/[0.02]">
                        <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-600 flex items-center justify-center text-subtitle1 font-bold font-archivo">
                              {qIndex + 1}
                            </div>
                            <h3 className="text-h6 font-archivo text-white pt-1">{question.text}</h3>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-0">
                            {question.options.map((option, optIndex) => {
                              const isSelected = quizAnswers[question.id]?.includes(option.id);
                              return (
                                <label
                                  key={option.id}
                                  className={`flex items-start gap-4 p-4 cursor-pointer transition-all border-b border-white/5 last:border-b-0 ${isSelected
                                    ? 'bg-red-500/10 hover:bg-red-500/15'
                                    : 'hover:bg-white/5'
                                    }`}
                                >
                                  <input
                                    type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                                    name={question.id}
                                    value={option.id}
                                    checked={isSelected}
                                    onChange={() => handleAnswerChange(question.id, option.id, question.type === 'multiple_choice')}
                                    className="mt-1 flex-shrink-0 w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <span className="text-body1 text-gray-200">{option.text}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleQuizSubmit}
                      className="w-full bg-red-600 hover:bg-red-700 rounded-none"
                    >
                      Submit Quiz
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Quiz Results Header */}
                    <div className={`border-l-4 ${quizScore >= (currentLesson.passingScore || 70) ? 'border-green-500 bg-gradient-to-r from-green-500/10' : 'border-red-500 bg-gradient-to-r from-red-500/10'} to-transparent p-8`}>
                      <div className="text-center">
                        <div className={`text-6xl font-bold font-archivo mb-3 ${quizScore >= (currentLesson.passingScore || 70) ? 'text-green-400' : 'text-red-400'}`}>
                          {quizScore}%
                        </div>
                        <div className="flex items-center justify-center gap-3 mb-2">
                          {quizScore >= (currentLesson.passingScore || 70) ? (
                            <Icons.Check className="h-6 w-6 text-green-400" />
                          ) : (
                            <span className="text-2xl text-red-400">✕</span>
                          )}
                          <h3 className="text-h4 font-archivo text-white font-bold">
                            {quizScore >= (currentLesson.passingScore || 70) ? 'Quiz Passed!' : 'Quiz Not Passed'}
                          </h3>
                        </div>
                        <p className="text-body1 text-gray-300">
                          {quizScore >= (currentLesson.passingScore || 70)
                            ? 'Congratulations! You have successfully completed this quiz.'
                            : `You need ${currentLesson.passingScore || 70}% to pass. Please review the answers below and try again.`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Answer Review Section */}
                    <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent p-6 mb-6">
                      <div className="flex items-center gap-3">
                        <Icons.BookOpen className="h-6 w-6 text-blue-400" />
                        <h3 className="text-h6 font-archivo text-white font-bold">Answer Review</h3>
                      </div>
                      <p className="text-body2 text-gray-300 ml-9 mt-1">Review your answers and explanations below</p>
                    </div>

                    {currentLesson.questions?.map((question, qIndex) => {
                      const userAnswers = quizAnswers[question.id] || [];
                      const correctAnswers = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
                      const isCorrect = question.type === 'single_choice'
                        ? userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])
                        : userAnswers.length === correctAnswers.length && userAnswers.every(ans => correctAnswers.includes(ans));

                      return (
                        <div key={question.id} className="border border-white/10 bg-white/[0.02]">
                          {/* Question Header */}
                          <div className={`p-6 border-b border-white/10 ${isCorrect ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-subtitle1 font-bold font-archivo ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                                {isCorrect ? <Icons.Check className="h-5 w-5" /> : <span className="text-lg">✕</span>}
                              </div>
                              <div className="flex-1 pt-1">
                                <h3 className="text-h6 font-archivo text-white">{question.text}</h3>
                                <p className={`text-caption text-uppercase tracking-wider mt-2 font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                  {isCorrect ? 'CORRECT' : 'INCORRECT'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Options Review */}
                          <div className="p-6">
                            <div className="space-y-0">
                              {question.options.map((option, optIndex) => {
                                const isUserAnswer = userAnswers.includes(option.id);
                                const isCorrectAnswer = correctAnswers.includes(option.id);
                                return (
                                  <div
                                    key={option.id}
                                    className={`flex items-start gap-4 p-4 border-b border-white/5 last:border-b-0 ${isCorrectAnswer
                                      ? 'bg-green-500/10'
                                      : isUserAnswer
                                        ? 'bg-red-500/10'
                                        : 'bg-white/[0.02]'
                                      }`}
                                  >
                                    <div className="flex-shrink-0 flex items-center gap-3 mt-0.5">
                                      {isCorrectAnswer && <Icons.Check className="h-5 w-5 text-green-400" />}
                                      {isUserAnswer && !isCorrectAnswer && <span className="text-red-400 text-lg">✕</span>}
                                      {!isUserAnswer && !isCorrectAnswer && <div className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                      <span className={`text-body1 ${isCorrectAnswer ? 'text-green-200 font-medium' : isUserAnswer ? 'text-red-200' : 'text-gray-400'}`}>
                                        {option.text}
                                      </span>
                                      {isCorrectAnswer && (
                                        <p className="text-caption text-green-400 mt-1">Correct Answer</p>
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <p className="text-caption text-red-400 mt-1">Your Answer</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="mt-6 border-l-4 border-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent p-4">
                                <div className="flex items-start gap-3">
                                  <Icons.Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-caption1 text-blue-300 mb-1">EXPLANATION</div>
                                    <p className="text-body2 text-gray-200">{question.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="flex-1 rounded-none"
                      >
                        Retake Quiz
                      </Button>
                      {quizScore >= (currentLesson.passingScore || 70) && currentLessonIndex < courseLessons.length - 1 && (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={goToNextLesson}
                          className="flex-1 bg-green-600 hover:bg-green-700 rounded-none"
                        >
                          Continue to Next Lesson
                          <Icons.ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
const StudentTraining = () => {
  const { courses, modules, lessons, enrollments, currentUser } = useData();
  const navigate = useNavigate();

  const myEnrollments = enrollments.filter(e => e.userId === currentUser?.id);
  const enrolledCourses = myEnrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    const courseModules = modules.filter(m => m.courseId === enrollment.courseId);
    const totalLessons = courseModules.flatMap(m =>
      lessons.filter(l => l.moduleId === m.id)
    ).length;
    const completedLessons = enrollment.completedLessons.length;

    return {
      ...course,
      enrollment,
      totalLessons,
      completedLessons,
      modules: courseModules.length
    };
  }).filter(c => c.id); // Remove undefined courses

  const activeCourses = enrolledCourses.filter(c => c.enrollment.status === 'active');
  const completedCourses = enrolledCourses.filter(c => c.enrollment.status === 'completed');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-h2 font-archivo text-white mb-2">My Training</h1>
        <p className="text-gray-400">Track your progress and continue your learning journey.</p>
      </div>

      {/* Active Courses */}
      {activeCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-h4 font-archivo text-white mb-6 flex items-center gap-3">
            <div className="h-1 w-12 bg-red-600 rounded-full"></div>
            Active Training
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCourses.map(course => (
              <div
                key={course.id}
                className="bg-white/5 border border-white/10 hover:border-red-500/30 rounded-lg overflow-hidden transition-all group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="outline" className="mb-2">{course.level}</Badge>
                    <h3 className="text-h5 font-archivo text-white font-bold">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-400 text-body2 mb-4 line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-white/10">
                    <div>
                      <div className="text-caption text-gray-500 mb-1">Progress</div>
                      <div className="text-subtitle1 font-archivo text-white font-bold">{course.enrollment.progress}%</div>
                    </div>
                    <div>
                      <div className="text-caption text-gray-500 mb-1">Completed</div>
                      <div className="text-subtitle1 font-archivo text-white font-bold">{course.completedLessons}/{course.totalLessons}</div>
                    </div>
                    <div>
                      <div className="text-caption text-gray-500 mb-1">Modules</div>
                      <div className="text-subtitle1 font-archivo text-white font-bold">{course.modules}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-caption mb-2">
                      <span className="text-gray-400">Course Progress</span>
                      <span className="text-white">{course.enrollment.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                        style={{ width: `${course.enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/portal/course/${course.id}`)}
                    className="w-full bg-red-600 hover:bg-red-700 rounded-none"
                  >
                    {course.enrollment.progress > 0 ? 'Continue Training' : 'Start Training'}
                    <Icons.ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-h4 font-archivo text-white mb-6 flex items-center gap-3">
            <div className="h-1 w-12 bg-green-600 rounded-full"></div>
            Completed Training
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map(course => (
              <div
                key={course.id}
                className="bg-white/5 border border-white/10 hover:border-green-500/30 rounded-lg overflow-hidden transition-all group relative"
              >
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-green-600 rounded-full p-2 shadow-lg">
                    <Icons.Check className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-subtitle1 font-archivo text-white font-bold">{course.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-caption mb-3">
                    <span className="text-green-400 flex items-center gap-2">
                      <Icons.Award className="h-4 w-4" />
                      100% Complete
                    </span>
                    <span className="text-gray-500">{course.totalLessons} Lessons</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/portal/course/${course.id}`)}
                    className="w-full border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-none"
                  >
                    Review Course
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Courses */}
      {myEnrollments.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.BookOpen className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Active Training</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Start your training journey from the dashboard.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/portal/dashboard')}
            className="bg-red-600 hover:bg-red-700"
          >
            Browse Available Courses
          </Button>
        </div>
      )}
    </div>
  );
};

const StudentCertifications = () => {
  const { courses, enrollments, currentUser } = useData();
  const navigate = useNavigate();

  const completedEnrollments = enrollments.filter(
    e => e.userId === currentUser?.id && e.status === 'completed'
  );

  const certificates = completedEnrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return {
      ...course,
      enrollment,
      completedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  }).filter(c => c.id);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-h2 font-archivo text-white mb-2">Certifications</h1>
        <p className="text-gray-400">View and download your earned certificates.</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div
              key={cert.id}
              className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-xl p-8 relative overflow-hidden group hover:border-red-500/50 transition-all"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-red-600 rounded-lg p-3 shadow-lg">
                    <Icons.Award className="h-8 w-8 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-300">
                    Certified
                  </Badge>
                </div>

                <h3 className="text-h4 font-archivo text-white font-bold mb-2">{cert.title}</h3>
                <p className="text-gray-400 text-body2 mb-6">{cert.level} Level Certification</p>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between text-caption mb-2">
                    <span className="text-gray-500">Awarded To</span>
                    <span className="text-white font-medium">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-gray-500">Completion Date</span>
                    <span className="text-white font-medium">{cert.completedDate}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full border border-white/20 hover:bg-white/10 text-white rounded-none"
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (!win) return;
                    win.document.write(`<html><head><title>${cert.title} Certificate</title><style>body{font-family:sans-serif;padding:60px;text-align:center;background:#fff}h1{font-size:2.5rem;margin-bottom:0.5rem}h2{font-size:1.8rem;color:#dc2626;margin-bottom:1rem}p{font-size:1.1rem;color:#555;margin:0.4rem 0}.badge{display:inline-block;border:2px solid #dc2626;padding:6px 20px;border-radius:4px;color:#dc2626;font-weight:bold;margin-top:1.5rem}</style></head><body><h1>Certificate of Completion</h1><h2>${cert.title}</h2><p>Awarded to: <strong>${currentUser?.firstName} ${currentUser?.lastName}</strong></p><p>Completion Date: ${cert.completedDate}</p><div class="badge">${cert.level} Level</div></body></html>`);
                    win.document.close();
                    win.print();
                  }}
                >
                  <Icons.Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.Award className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Certificates Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Complete your training courses to earn certificates. Each completed course will appear here.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/portal/dashboard')}
            className="bg-red-600 hover:bg-red-700"
          >
            Start Training
          </Button>
        </div>
      )}
    </div>
  );
};

// Student Live Sessions Page
const StudentLiveSessions = () => {
  const { liveSessions } = useData();
  const navigate = useNavigate();

  // Defensive check - ensure liveSessions is defined
  if (!liveSessions || !Array.isArray(liveSessions)) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">Loading Live Sessions...</h1>
      </div>
    );
  }

  const now = new Date();
  const upcomingSessions = liveSessions
    .filter(session => {
      const sessionDateTime = new Date(`${session.scheduledDate}T${session.scheduledTime}`);
      return sessionDateTime >= now && session.status !== 'completed';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  const pastSessions = liveSessions
    .filter(session => {
      const sessionDateTime = new Date(`${session.scheduledDate}T${session.scheduledTime}`);
      return sessionDateTime < now || session.status === 'completed';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateB.getTime() - dateA.getTime();
    });

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTimeUntil = (date: string, time: string) => {
    const sessionDateTime = new Date(`${date}T${time}`);
    const diff = sessionDateTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    return 'Starting now';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-h2 font-archivo text-white mb-2">Live Sessions</h1>
        <p className="text-gray-400">Join live training sessions and virtual classes.</p>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-h4 font-archivo text-white mb-6 flex items-center gap-3">
            <span className="h-1 w-8 bg-red-600"></span>
            Upcoming Sessions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingSessions.map(session => {
              const { date, time } = formatDateTime(session.scheduledDate, session.scheduledTime);
              return (
                <Card key={session.id} className="p-6 border-white/10 hover:border-red-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 rounded-lg p-3">
                        <Icons.Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-h5 font-archivo text-white font-bold">{session.title}</h3>
                        <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-300 mt-1">
                          {getTimeUntil(session.scheduledDate, session.scheduledTime)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-body2 mb-4">{session.description}</p>

                  <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-caption">
                      <Icons.Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-gray-400">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      <Icons.Clock className="h-4 w-4 text-red-600" />
                      <span className="text-gray-400">{time}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open(session.meetingLink, '_blank', 'noopener,noreferrer')}
                  >
                    <Icons.Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-h4 font-archivo text-white mb-6 flex items-center gap-3">
            <span className="h-1 w-8 bg-gray-600"></span>
            Past Sessions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastSessions.map(session => {
              const { date, time } = formatDateTime(session.scheduledDate, session.scheduledTime);
              return (
                <Card key={session.id} className="p-6 border-white/10 opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-600 rounded-lg p-3">
                        <Icons.Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-h5 font-archivo text-white font-bold">{session.title}</h3>
                        <Badge variant="outline" className="bg-gray-500/20 border-gray-500 text-gray-400 mt-1">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-body2 mb-4">{session.description}</p>

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-caption">
                      <Icons.Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-500">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      <Icons.Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-500">{time}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingSessions.length === 0 && pastSessions.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.Video className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Live Sessions</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            There are no live sessions scheduled at this time. Check back later for upcoming sessions.
          </p>
        </div>
      )}
    </div>
  );
};

// Student Exams Page
const StudentExams = () => {
  const { exams, examAttempts, currentUser } = useData();
  const navigate = useNavigate();

  // Defensive checks - ensure all required data is available
  if (!currentUser) return null;

  if (!exams || !Array.isArray(exams) || !examAttempts || !Array.isArray(examAttempts)) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">Loading Exams...</h1>
      </div>
    );
  }

  const availableExams = exams.filter(exam =>
    exam.assignedTo.length === 0 || exam.assignedTo.includes(currentUser.id)
  );

  const userAttempts = examAttempts.filter(a => a.userId === currentUser.id);

  const getExamStatus = (examId: string) => {
    const attempts = userAttempts.filter(a => a.examId === examId);
    if (attempts.length === 0) return { status: 'not_started', attempts: 0 };
    const lastAttempt = attempts[attempts.length - 1];
    const exam = exams.find(e => e.id === examId);
    if (!exam) return { status: 'not_started', attempts: attempts.length };

    if (attempts.length >= exam.maxAttempts && lastAttempt.status !== 'submitted') {
      return { status: 'max_attempts', attempts: attempts.length, lastScore: lastAttempt.score };
    }
    if (lastAttempt.status === 'submitted') {
      return { status: 'completed', attempts: attempts.length, lastScore: lastAttempt.score, passed: lastAttempt.passed };
    }
    if (lastAttempt.status === 'in_progress') {
      return { status: 'in_progress', attempts: attempts.length };
    }
    return { status: 'available', attempts: attempts.length };
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-h2 font-archivo text-white mb-2">Exams</h1>
        <p className="text-gray-400">Take your assigned exams and assessments.</p>
      </div>

      {availableExams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableExams.map(exam => {
            const examStatus = getExamStatus(exam.id);
            return (
              <Card key={exam.id} className="p-6 border-white/10 hover:border-red-500/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600 rounded-lg p-3">
                      <Icons.Clipboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-h5 font-archivo text-white font-bold">{exam.title}</h3>
                      {examStatus.status === 'completed' && (
                        <Badge variant={examStatus.passed ? 'success' : 'warning'} className="mt-1">
                          {examStatus.passed ? 'Passed' : 'Failed'} - {examStatus.lastScore}%
                        </Badge>
                      )}
                      {examStatus.status === 'in_progress' && (
                        <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-300 mt-1">
                          In Progress
                        </Badge>
                      )}
                      {examStatus.status === 'max_attempts' && (
                        <Badge variant="outline" className="bg-gray-500/20 border-gray-500 text-gray-400 mt-1">
                          Max Attempts Reached
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-body2 mb-4">{exam.description}</p>

                <div className="border-t border-white/10 pt-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-white">{exam.totalTimeMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">Passing Score</span>
                    <span className="text-white">{exam.passingScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">Attempts</span>
                    <span className="text-white">
                      {examStatus.attempts} / {exam.maxAttempts === 999 ? '∞' : exam.maxAttempts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">Questions</span>
                    <span className="text-white">{exam.questions.length}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={examStatus.status === 'max_attempts' || examStatus.status === 'in_progress'}
                  onClick={() => navigate(`/portal/exam/${exam.id}`)}
                >
                  {examStatus.status === 'completed' && 'Review Results'}
                  {examStatus.status === 'not_started' && 'Start Exam'}
                  {examStatus.status === 'available' && 'Retake Exam'}
                  {examStatus.status === 'in_progress' && 'Continue Exam'}
                  {examStatus.status === 'max_attempts' && 'Max Attempts Reached'}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.Clipboard className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Exams Available</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            There are no exams assigned to you at this time. Your instructor will assign exams as needed.
          </p>
        </div>
      )}
    </div>
  );
};

// Exam Taking Interface
const ExamTaking = () => {
  const { examId } = useParams<{ examId: string }>();
  const { exams, currentUser, startExamAttempt, submitExamAttempt, getExamAttempt } = useData();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Defensive check for exams array
  const exam = exams && Array.isArray(exams) ? exams.find(e => e.id === examId) : undefined;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Prevent starting multiple attempts
    if (hasStarted || attemptId) return;
    if (!exam || !currentUser) return;

    setHasStarted(true);
    (async () => {
      try {
        const newAttemptId = await startExamAttempt(examId!, currentUser.id);
        setAttemptId(newAttemptId);
        setTimeRemaining(exam.totalTimeMinutes * 60);
      } catch (error: any) {
        showToast(error.message || 'Unable to start exam', 'error');
        navigate('/portal/exams');
      }
    })();
  }, [examId, currentUser, exam, hasStarted, attemptId]);

  useEffect(() => {
    if (!attemptId || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, timeRemaining, isSubmitted]);

  useEffect(() => {
    if (!exam || !exam.timePerQuestionSeconds) return;

    const question = exam.questions[currentQuestionIndex];
    if (!question) return;

    setQuestionTimeRemaining(question.timeLimitSeconds || exam.timePerQuestionSeconds || null);
  }, [currentQuestionIndex, exam]);

  useEffect(() => {
    if (questionTimeRemaining === null || questionTimeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleNextQuestion();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionTimeRemaining, isSubmitted]);

  const handleAutoSubmit = async () => {
    if (attemptId && !isSubmitted) {
      try {
        await submitExamAttempt(attemptId, answers);
        setIsSubmitted(true);
        showToast('Time expired. Exam submitted automatically.', 'info');
      } catch (error: any) {
        showToast(error.message || 'Failed to submit exam', 'error');
      }
    }
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    if (window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      try {
        await submitExamAttempt(attemptId, answers);
        setIsSubmitted(true);
        showToast('Exam submitted successfully!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to submit exam', 'error');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam || !currentUser) {
    return (
      <div className="p-8">
        <h1 className="text-h2 font-archivo text-white mb-4">Exam Not Found</h1>
        <Button onClick={() => navigate('/portal/exams')}>Back to Exams</Button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const attempt = attemptId ? getExamAttempt(attemptId) : undefined;

  if (isSubmitted && attempt) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${attempt.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {attempt.passed ? (
                <Icons.Check className="h-10 w-10 text-green-500" />
              ) : (
                <Icons.X className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h2 className="text-h3 font-archivo text-white mb-2">
              {attempt.passed ? 'Exam Passed!' : 'Exam Failed'}
            </h2>
            <p className="text-4xl font-bold text-white mb-2">{attempt.score}%</p>
            <p className="text-gray-400">Passing Score: {exam.passingScore}%</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/portal/exams')}
          >
            Back to Exams
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#030712]">
      {/* Header with Timer */}
      <div className="bg-[#0a0f1c] border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-h4 font-archivo text-white">{exam.title}</h1>
            <p className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
            {questionTimeRemaining !== null && (
              <div className="text-right">
                <p className="text-caption text-gray-400">Question Time</p>
                <p className={`text-h5 font-bold ${questionTimeRemaining < 10 ? 'text-red-500' : 'text-white'}`}>
                  {formatTime(questionTimeRemaining)}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-caption text-gray-400">Total Time</p>
              <p className={`text-h5 font-bold ${timeRemaining < 60 ? 'text-red-500' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">{currentQuestion.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}</Badge>
                <span className="text-caption text-gray-400">{currentQuestion.points} points</span>
              </div>
              <h2 className="text-h4 font-archivo text-white mb-4">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map(option => {
                const isSelected = (answers[currentQuestion.id] || []).includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                      ? 'border-red-600 bg-red-600/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                  >
                    <input
                      type={currentQuestion.type === 'single_choice' ? 'radio' : 'checkbox'}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(currentQuestion.id, option.id, currentQuestion.type === 'multiple_choice')}
                      className="h-5 w-5 text-red-600"
                    />
                    <span className="text-white flex-1">{option.text}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <Icons.ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextQuestion}
              >
                Next
                <Icons.ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard - Overview
const AdminDashboard = () => {
  const { courses, enrollments, users, modules, lessons } = useData();

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalEnrollments = enrollments.length;
  const activeTrainees = users.filter(u => u.role === 'user' && u.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
  const avgProgress = totalEnrollments > 0 ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / totalEnrollments) : 0;

  // Course-specific analytics
  const courseStats = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
    const completed = courseEnrollments.filter(e => e.status === 'completed').length;
    const avgCourseProgress = courseEnrollments.length > 0
      ? Math.round(courseEnrollments.reduce((acc, e) => acc + e.progress, 0) / courseEnrollments.length)
      : 0;
    return {
      ...course,
      enrollmentCount: courseEnrollments.length,
      completedCount: completed,
      avgProgress: avgCourseProgress
    };
  });

  // Source company distribution
  const trainees = users.filter(u => u.role === 'user');
  const sourceDistribution = trainees.reduce((acc, user) => {
    const source = user.source || 'Unassigned';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-end justify-between border-b border-red-900/20 pb-6">
        <div>
          <h1 className="text-h2 font-archivo font-medium text-white tracking-wide">Admin Overview</h1>
          <p className="text-gray-400 mt-1 text-body1 font-light">Complete system overview and statistics</p>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Trainees</p>
            <p className="text-3xl font-archivo text-white">{totalUsers}</p>
          </div>
          <div className="h-12 w-12 bg-red-900/20 border border-red-900/30 flex items-center justify-center text-red-500 group-hover:bg-red-900/30 transition-colors">
            <Icons.Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Trainees</p>
            <p className="text-3xl font-archivo text-white">{activeTrainees}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-900/20 border border-emerald-900/30 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-900/30 transition-colors">
            <Icons.Check className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Training Courses</p>
            <p className="text-3xl font-archivo text-white">{courses.length}</p>
          </div>
          <div className="h-12 w-12 bg-blue-900/20 border border-blue-900/30 flex items-center justify-center text-blue-500 group-hover:bg-blue-900/30 transition-colors">
            <Icons.BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Enrollments</p>
            <p className="text-3xl font-archivo text-white">{totalEnrollments}</p>
          </div>
          <div className="h-12 w-12 bg-amber-900/20 border border-amber-900/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-900/30 transition-colors">
            <Icons.Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Completion Rate</p>
            <p className="text-3xl font-archivo text-white">{completionRate}%</p>
          </div>
          <div className="h-12 w-12 bg-purple-900/20 border border-purple-900/30 flex items-center justify-center text-purple-500 group-hover:bg-purple-900/30 transition-colors">
            <Icons.TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Avg. Progress</p>
            <p className="text-3xl font-archivo text-white">{avgProgress}%</p>
          </div>
          <div className="h-12 w-12 bg-cyan-900/20 border border-cyan-900/30 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-900/30 transition-colors">
            <Icons.BarChart className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-archivo text-white">{completedEnrollments}</p>
          </div>
          <div className="h-12 w-12 bg-green-900/20 border border-green-900/30 flex items-center justify-center text-green-500 group-hover:bg-green-900/30 transition-colors">
            <Icons.Award className="h-5 w-5" />
          </div>
        </div>

        <div className="p-6 border border-red-900/20 bg-[#0f121a]/60 backdrop-blur-md flex items-center justify-between group hover:border-red-900/40 transition-colors">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Lessons</p>
            <p className="text-3xl font-archivo text-white">{lessons.length}</p>
          </div>
          <div className="h-12 w-12 bg-orange-900/20 border border-orange-900/30 flex items-center justify-center text-orange-500 group-hover:bg-orange-900/30 transition-colors">
            <Icons.FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Course Performance & Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="border border-red-900/20 bg-[#0f121a]/60 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-6 bg-red-600"></span>
            <h2 className="text-lg font-archivo font-bold text-white uppercase tracking-widest">Course Performance</h2>
          </div>
          <div className="space-y-4">
            {courseStats.map(course => (
              <div key={course.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white truncate max-w-[200px]">{course.title}</span>
                  <span className="text-xs text-gray-500">{course.enrollmentCount} enrolled • {course.completedCount} completed</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${course.avgProgress}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">{course.avgProgress}% avg progress</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="border border-red-900/20 bg-[#0f121a]/60 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-6 bg-red-600"></span>
            <h2 className="text-lg font-archivo font-bold text-white uppercase tracking-widest">Trainees by Source</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(sourceDistribution).map(([source, count]) => {
              const percentage = Math.round((count / totalUsers) * 100);
              return (
                <div key={source} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white">{source}</span>
                      <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-6 bg-red-600"></span>
          <h2 className="text-lg font-archivo font-bold text-white uppercase tracking-widest">Recent Enrollments</h2>
        </div>

        <div className="border border-red-900/20 bg-[#0f121a]/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-900/20">
                  <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Trainee</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 5).map((enrollment) => {
                  const user = users.find(u => u.id === enrollment.userId);
                  const course = courses.find(c => c.id === enrollment.courseId);
                  return (
                    <tr key={enrollment.id} className="border-b border-red-900/10 hover:bg-red-900/5 transition-colors">
                      <td className="px-3 py-2.5 text-white text-sm">{user?.firstName} {user?.lastName}</td>
                      <td className="px-3 py-2.5 text-gray-400 text-sm">{course?.title}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={enrollment.status === 'completed' ? 'success' : 'default'} className="rounded-none text-xs">
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full rounded-full ${enrollment.progress === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-sm">{enrollment.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Courses Management
const AdminCourses = () => {
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse, deleteCourse } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', level: 'Beginner', duration: 120, modules: 1, image: '' });
  const { toast, showToast, closeToast } = useNotification();

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      await addCourse(newCourse);
      showToast(`Course "${newCourse.title}" added successfully`, 'success');
      setShowAddModal(false);
      setNewCourse({ title: '', description: '', level: 'Beginner', duration: 120, modules: 1, image: '' });
    } catch (error) {
      showToast('Failed to add course', 'error');
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !editingCourse.title || !editingCourse.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      await updateCourse(editingCourse.id, editingCourse);
      showToast(`Course "${editingCourse.title}" updated successfully`, 'success');
      setShowEditModal(false);
      setEditingCourse(null);
    } catch (error) {
      showToast('Failed to update course', 'error');
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (confirm(`Are you sure you want to delete "${course.title}"? This will also delete all modules and lessons.`)) {
      try {
        await deleteCourse(course.id);
        showToast(`Course "${course.title}" deleted successfully`, 'success');
      } catch (error) {
        showToast('Failed to delete course', 'error');
      }
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse({ ...course });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}

      <div className="flex items-end justify-between border-b border-red-900/20 pb-6">
        <div>
          <h1 className="text-h2 font-archivo font-medium text-white tracking-wide">Training Modules</h1>
          <p className="text-gray-400 mt-1 text-body1 font-light">Manage and create training courses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-none bg-red-600 hover:bg-red-700">
          <Icons.Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="border border-red-900/20 bg-[#0f121a]/60 hover:border-red-900/40 transition-all group">
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/admin/courses/${course.id}`)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img src={course.image} alt={course.title} className="h-full w-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500" />
                <Badge className="absolute top-4 right-4 bg-black/80 border-white/10 text-white rounded-none">{course.level}</Badge>
              </div>
              <div className="p-6">
                <h3 className="font-archivo text-xl font-medium mb-2 text-white">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{course.duration} min</span>
                  <span>•</span>
                  <span>{course.modules} modules</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none border border-white/10 hover:bg-white/5"
                onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
              >
                <Icons.Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none border border-red-900/20 hover:bg-red-900/20 text-red-400"
                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course); }}
              >
                <Icons.Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Training Module">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Course Title *</label>
            <Input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Enter course title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description *</label>
            <Textarea
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder="Enter course description"
              className="min-h-[60px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Level</label>
              <Select value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration (min)</label>
              <Input type="number" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Image URL</label>
            <Input value={newCourse.image} onChange={(e) => setNewCourse({ ...newCourse, image: e.target.value })} placeholder="https://..." />
            <p className="text-xs text-gray-500 mt-1.5">Recommended: landscape 16:9 or 2:1, e.g. 1024×576 or 800×450. Paste any image URL.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAddCourse} className="flex-1 rounded-none">Add Course</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-none">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Training Module">
        {editingCourse && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Course Title *</label>
              <Input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} placeholder="Enter course title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
              <Textarea value={editingCourse.description} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} placeholder="Enter course description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Level</label>
                <Select value={editingCourse.level} onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as any })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
                <Input type="number" value={editingCourse.duration} onChange={(e) => setEditingCourse({ ...editingCourse, duration: parseInt(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Image URL</label>
              <Input value={editingCourse.image} onChange={(e) => setEditingCourse({ ...editingCourse, image: e.target.value })} placeholder="https://..." />
              <p className="text-xs text-gray-500 mt-1.5">Recommended: landscape 16:9 or 2:1, e.g. 1024×576 or 800×450. Paste any image URL.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleEditCourse} className="flex-1 rounded-none">Update Course</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 rounded-none">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Admin Users Management
const AdminUsers = () => {
  const { users, courses, enrollments, registerCreatedUser, updateUser, deleteUser, enrollUser, unenrollUser } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [coursesModalUser, setCoursesModalUser] = useState<User | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; name: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'all' | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'user' as 'user' | 'admin', status: 'active' as 'active' | 'inactive', source: '' });
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const { toast, showToast, closeToast } = useNotification();

  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const specials = '!@#$%&*';
    const all = upper + lower + digits + specials;
    const pick = (set: string, n = 1) => {
      const buf = new Uint32Array(n);
      crypto.getRandomValues(buf);
      let out = '';
      for (let i = 0; i < n; i++) out += set.charAt(buf[i] % set.length);
      return out;
    };
    const required = pick(upper) + pick(lower) + pick(digits) + pick(specials);
    const rest = pick(all, 8);
    const pwdArr = (required + rest).split('');
    const shuffleBuf = new Uint32Array(pwdArr.length);
    crypto.getRandomValues(shuffleBuf);
    for (let i = pwdArr.length - 1; i > 0; i--) {
      const j = shuffleBuf[i] % (i + 1);
      [pwdArr[i], pwdArr[j]] = [pwdArr[j], pwdArr[i]];
    }
    return pwdArr.join('');
  };

  const createTraineeAccount = async (
    userData: Pick<User, 'firstName' | 'lastName' | 'email'> & { source?: string },
    password: string
  ) => {
    const { data, error } = await supabase.functions.invoke('create-trainee', {
      body: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        source: userData.source || '',
        password
      }
    });

    let errMsg: string | undefined = data?.error;
    if (!errMsg && error) {
      const ctx = (error as any).context;
      if (ctx instanceof Response) {
        try {
          const body = await ctx.clone().json();
          errMsg = body?.error;
        } catch {
          try { errMsg = await ctx.clone().text(); } catch {}
        }
      } else if (ctx && typeof ctx === 'object') {
        errMsg = ctx.error;
      }
      if (!errMsg) errMsg = (error as any).message;
    }
    if (errMsg) throw new Error(errMsg);
    if (!data?.user) throw new Error('Failed to create trainee');

    return data.user as User;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: 'email' | 'password' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  // CSV Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvData, setCsvData] = useState<Array<{ firstName: string; lastName: string; email: string; source?: string }>>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Parse CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

        // Validate headers
        const requiredHeaders = ['firstname', 'lastname', 'email'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setImportError(`Missing required columns: ${missingHeaders.join(', ')}`);
          setCsvData([]);
          return;
        }

        const firstNameIdx = headers.indexOf('firstname');
        const lastNameIdx = headers.indexOf('lastname');
        const emailIdx = headers.indexOf('email');
        const sourceIdx = headers.indexOf('source');

        const users = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          return {
            firstName: values[firstNameIdx] || '',
            lastName: values[lastNameIdx] || '',
            email: values[emailIdx] || '',
            source: sourceIdx >= 0 ? values[sourceIdx] : ''
          };
        }).filter(u => u.firstName && u.lastName && u.email);

        if (users.length === 0) {
          setImportError('No valid users found in CSV file');
          setCsvData([]);
          return;
        }

        setCsvData(users);
        setImportError(null);
      } catch (err) {
        setImportError('Failed to parse CSV file. Please check the format.');
        setCsvData([]);
      }
    };
    reader.readAsText(file);
  };

  // Import users from CSV
  const handleBulkImport = async () => {
    if (csvData.length === 0) return;

    let successCount = 0;
    let failCount = 0;
    for (const userData of csvData) {
      try {
        const tempPassword = generatePassword();
        const createdUser = await createTraineeAccount({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          source: userData.source || ''
        }, tempPassword);
        registerCreatedUser(createdUser);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) showToast(`Successfully imported ${successCount} trainee(s)`, 'success');
    if (failCount > 0) showToast(`${failCount} import(s) failed — check for duplicate emails`, 'error');
    setShowImportModal(false);
    setCsvData([]);
  };

  // Export trainees to CSV
  const handleExportCSV = () => {
    const dataToExport = selectedTrainees.length > 0
      ? allTrainees.filter(t => selectedTrainees.includes(t.id))
      : allTrainees;

    if (dataToExport.length === 0) {
      showToast('No trainees to export', 'error');
      return;
    }

    const headers = ['FirstName', 'LastName', 'Email', 'Source', 'Status', 'Enrolled Courses', 'Avg Progress'];
    const rows = dataToExport.map(user => {
      const userEnrollments = enrollments.filter(e => e.userId === user.id);
      const enrolledCourses = userEnrollments.map(e => {
        const course = courses.find(c => c.id === e.courseId);
        return course?.title || '';
      }).filter(Boolean).join('; ');
      const avgProgress = userEnrollments.length > 0
        ? Math.round(userEnrollments.reduce((acc, e) => acc + e.progress, 0) / userEnrollments.length)
        : 0;

      return [
        user.firstName,
        user.lastName,
        user.email,
        user.source || '',
        user.status,
        enrolledCourses,
        `${avgProgress}%`
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trainees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${dataToExport.length} trainee(s) to CSV`, 'success');
  };

  const allTrainees = users.filter(u => u.role === 'user');

  // Get unique source companies for filter dropdown
  const sourceCompanies = [...new Set(allTrainees.map(u => u.source).filter(Boolean))] as string[];

  // Filter trainees based on search and filters
  const trainees = allTrainees.filter(user => {
    const matchesSearch = searchQuery === '' ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || user.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !(e.target as HTMLElement).closest('.relative')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const toggleSelectAll = () => {
    const filteredIds = trainees.map(t => t.id);
    const allFilteredSelected = filteredIds.every(id => selectedTrainees.includes(id));
    if (allFilteredSelected) {
      // Deselect all filtered trainees
      setSelectedTrainees(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered trainees (add to existing selection)
      setSelectedTrainees(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelectTrainee = (id: string) => {
    setSelectedTrainees(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setSaving(true);
    const tempPassword = generatePassword();

    try {
      const createdUser = await createTraineeAccount(newUser, tempPassword);
      registerCreatedUser(createdUser);

      setCreatedCredentials({
        email: newUser.email,
        password: tempPassword,
        name: `${newUser.firstName} ${newUser.lastName}`
      });

      setShowAddModal(false);
      setShowCredentialsModal(true);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'user', status: 'active', source: '' });
      showToast(`Trainee "${newUser.firstName} ${newUser.lastName}" created successfully`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create trainee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTrainees.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTrainees.length} trainee(s)? This will also remove all their enrollments.`)) {
      try {
        const count = selectedTrainees.length;
        for (const id of selectedTrainees) {
          await deleteUser(id);
        }
        showToast(`${count} trainee(s) deleted successfully`, 'success');
        setSelectedTrainees([]);
      } catch (error: any) {

        showToast(error.message || 'Failed to delete some trainees', 'error');
      }
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !editingUser.firstName || !editingUser.lastName || !editingUser.email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (!editingUser.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateUser(editingUser.id, editingUser);
      showToast(`Trainee "${editingUser.firstName} ${editingUser.lastName}" updated successfully`, 'success');
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to update trainee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setOpenMenuId(null);
    if (confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"? This will also remove all their enrollments.`)) {
      try {
        await deleteUser(user.id);
        showToast(`Trainee "${user.firstName} ${user.lastName}" deleted successfully`, 'success');
      } catch (error: any) {

        showToast(error.message || 'Failed to delete trainee', 'error');
      }
    }
  };

  const handleUnassignCourse = async (userId: string, courseId: string, courseTitle: string) => {
    if (!confirm(`Remove "${courseTitle}" from this trainee? Their progress for this course will be lost.`)) return;
    try {
      await unenrollUser(userId, courseId);
      showToast(`Removed "${courseTitle}" from trainee`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to remove course', 'error');
    }
  };

  const openCoursesModal = (user: User) => {
    setCoursesModalUser(user);
    setShowCoursesModal(true);
    setOpenMenuId(null);
  };

  const handleAssignCourse = async (courseId: string) => {
    if (selectedUser && courseId) {
      try {
        await enrollUser(selectedUser, courseId);
        const user = users.find(u => u.id === selectedUser);
        const course = courses.find(c => c.id === courseId);
        showToast(`Assigned "${course?.title}" to ${user?.firstName} ${user?.lastName}`, 'success');
        setShowAssignModal(false);
        setSelectedUser('');
      } catch (error: any) {

        showToast(error.message || 'Failed to assign course', 'error');
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}

      {selectedTrainees.length > 0 && (
        <div className="fixed top-20 right-8 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500/50 rounded-lg px-6 py-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{selectedTrainees.length} trainee(s) selected</span>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="rounded-none">
              <Icons.Trash className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedTrainees([])} className="rounded-none text-white hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-red-900/20 pb-6">
        <div>
          <h1 className="text-h3 sm:text-h2 font-archivo font-medium text-white tracking-wide">Trainee Management</h1>
          <p className="text-gray-400 mt-1 text-body2 sm:text-body1 font-light">Manage trainees and course assignments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="sm" className="rounded-none bg-red-600 hover:bg-red-700">
          <Icons.Plus className="h-4 w-4 mr-2" />
          Add Trainee
        </Button>
      </div>

      <div>

        {/* Search Bar - Standalone */}
        <div className="relative max-w-md">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-red-900/20"
          />
        </div>

        {/* Action Toolbar with Filters */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm mt-6">
          <div className="flex gap-2 sm:gap-3 flex-wrap items-center">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Sources</option>
              {sourceCompanies.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </Select>
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            <Button onClick={() => setShowImportModal(true)} size="sm" variant="outline" className="rounded-none text-xs sm:text-sm">
              <Icons.FileUp className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleExportCSV} size="sm" variant="outline" className="rounded-none text-xs sm:text-sm">
              <Icons.Download className="h-4 w-4 mr-2" />
              {selectedTrainees.length > 0 ? `Export (${selectedTrainees.length})` : 'Export CSV'}
            </Button>
            <Button onClick={() => setShowAssignModal(true)} size="sm" variant="outline" className="rounded-none text-xs sm:text-sm">
              <Icons.BookOpen className="h-4 w-4 mr-2" />
              Assign Course
            </Button>
            {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSourceFilter('all');
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
          {selectedTrainees.length > 0 && (
            <div className="text-sm text-gray-400">
              {selectedTrainees.length} trainee{selectedTrainees.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {trainees.length} of {allTrainees.length} trainee(s)
      </div>

      <div className="border border-red-900/20 bg-[#0f121a]/60">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-red-900/20">
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={trainees.length > 0 && trainees.every(t => selectedTrainees.includes(t.id))}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-700 bg-black/40 text-red-600 focus:ring-red-600 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Source</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Courses</th>
                <th className="text-right px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-14">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainees.map((user) => {
                const userEnrollments = enrollments.filter(e => e.userId === user.id);
                return (
                  <tr key={user.id} className="border-b border-red-900/10 hover:bg-red-900/5 transition-colors">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedTrainees.includes(user.id)}
                        onChange={() => toggleSelectTrainee(user.id)}
                        className="h-4 w-4 rounded border-gray-700 bg-black/40 text-red-600 focus:ring-red-600 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-white text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-gray-400 text-xs md:hidden">{user.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-sm hidden md:table-cell">{user.email}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-sm hidden lg:table-cell">{user.source || 'N/A'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={user.status === 'active' ? 'success' : 'default'} className="rounded-none text-xs">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />{user.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-sm hidden sm:table-cell">{userEnrollments.length}</td>
                    <td className="px-3 py-2.5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-1 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                        >
                          <Icons.MoreVertical className="h-5 w-5" />
                        </button>
                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-[#0a0f1c] border border-red-900/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                openEditModal(user);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-red-900/10 transition-colors flex items-center gap-2 text-gray-300 hover:text-white text-sm"
                            >
                              <Icons.Edit className="h-4 w-4" />
                              Edit Trainee
                            </button>
                            <button
                              onClick={() => openCoursesModal(user)}
                              className="w-full text-left px-3 py-2 hover:bg-red-900/10 transition-colors flex items-center gap-2 text-gray-300 hover:text-white text-sm"
                            >
                              <Icons.BookOpen className="h-4 w-4" />
                              Manage Courses
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="w-full text-left px-3 py-2 hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
                            >
                              <Icons.Trash className="h-4 w-4" />
                              Delete Trainee
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Trainee">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-firstName" className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
              <Input id="add-firstName" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} placeholder="John" />
            </div>
            <div>
              <label htmlFor="add-lastName" className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
              <Input id="add-lastName" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label htmlFor="add-email" className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <Input id="add-email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john.doe@example.com" />
          </div>
          <div>
            <label htmlFor="add-source" className="block text-sm font-medium text-gray-300 mb-2">Source Company</label>
            <Input id="add-source" value={newUser.source} onChange={(e) => setNewUser({ ...newUser, source: e.target.value })} placeholder="e.g., Company Name" />
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleAddUser} className="flex-1 rounded-none" disabled={saving}>{saving ? 'Creating...' : 'Add Trainee'}</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 rounded-none">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Trainee">
        {editingUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <Input
                  id="edit-firstName"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                <Input
                  id="edit-lastName"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label htmlFor="edit-source" className="block text-sm font-medium text-gray-300 mb-2">Source Company</label>
              <Input
                id="edit-source"
                value={editingUser.source || ''}
                onChange={(e) => setEditingUser({ ...editingUser, source: e.target.value })}
                placeholder="e.g., Company Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <Select
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <Select
                  id="edit-status"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleEditUser} className="flex-1 rounded-none" disabled={saving}>{saving ? 'Saving...' : 'Update Trainee'}</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 rounded-none">Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={selectedTrainees.length > 0 ? `Assign Course to ${selectedTrainees.length} Trainee(s)` : "Assign Course to Trainee"}>
        <div className="space-y-4">
          {selectedTrainees.length === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Trainee</label>
              <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Choose a trainee...</option>
                {trainees.map(user => (
                  <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </Select>
            </div>
          )}
          {selectedTrainees.length > 0 && (
            <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-medium">{selectedTrainees.length} trainee(s)</span> selected for bulk assignment
              </p>
              <p className="text-blue-400/70 text-xs mt-1">
                {trainees.filter(t => selectedTrainees.includes(t.id)).slice(0, 3).map(t => `${t.firstName} ${t.lastName}`).join(', ')}
                {selectedTrainees.length > 3 && ` and ${selectedTrainees.length - 3} more...`}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Course</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {courses.map(course => {
                const targetUsers = selectedTrainees.length > 0 ? selectedTrainees : (selectedUser ? [selectedUser] : []);
                const alreadyEnrolledCount = targetUsers.filter(userId =>
                  enrollments.some(e => e.userId === userId && e.courseId === course.id)
                ).length;
                const isAllEnrolled = targetUsers.length > 0 && alreadyEnrolledCount === targetUsers.length;

                return (
                  <button
                    key={course.id}
                    onClick={async () => {
                      if (selectedTrainees.length > 0) {
                        // Bulk assign
                        let assignedCount = 0;
                        let failCount = 0;
                        for (const userId of selectedTrainees) {
                          if (!enrollments.some(e => e.userId === userId && e.courseId === course.id)) {
                            try {
                              await enrollUser(userId, course.id);
                              assignedCount++;
                            } catch {
                              failCount++;
                            }
                          }
                        }
                        if (assignedCount > 0) {
                          showToast(`Assigned "${course.title}" to ${assignedCount} trainee(s)`, 'success');
                        } else if (failCount === 0) {
                          showToast('All selected trainees are already enrolled in this course', 'info');
                        }
                        if (failCount > 0) showToast(`${failCount} assignment(s) failed`, 'error');
                        setShowAssignModal(false);
                        setSelectedTrainees([]);
                      } else {
                        handleAssignCourse(course.id);
                      }
                    }}
                    className={`w-full text-left p-3 border transition-all rounded-none ${isAllEnrolled
                      ? 'border-green-900/30 bg-green-900/10 cursor-not-allowed'
                      : 'border-red-900/20 hover:border-red-900/40 bg-black/40 hover:bg-red-900/10'
                      }`}
                    disabled={targetUsers.length === 0 || isAllEnrolled}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{course.title}</div>
                        <div className="text-xs text-gray-500">{course.level} • {course.duration} min</div>
                      </div>
                      {isAllEnrolled && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Icons.Check className="h-3 w-3" /> Enrolled
                        </span>
                      )}
                      {!isAllEnrolled && alreadyEnrolledCount > 0 && (
                        <span className="text-xs text-amber-400">
                          {alreadyEnrolledCount}/{targetUsers.length} enrolled
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCoursesModal} onClose={() => setShowCoursesModal(false)} title={coursesModalUser ? `Courses for ${coursesModalUser.firstName} ${coursesModalUser.lastName}` : 'Courses'}>
        {coursesModalUser && (() => {
          const userEnrollments = enrollments.filter(e => e.userId === coursesModalUser.id);
          if (userEnrollments.length === 0) {
            return (
              <div className="p-6 text-center border border-red-900/20 bg-black/40 rounded-none">
                <p className="text-gray-400 text-sm">No courses assigned to this trainee.</p>
                <Button
                  onClick={() => {
                    setShowCoursesModal(false);
                    setSelectedUser(coursesModalUser.id);
                    setShowAssignModal(true);
                  }}
                  className="mt-4 rounded-none"
                  variant="primary"
                  size="sm"
                >
                  Assign a Course
                </Button>
              </div>
            );
          }
          return (
            <div className="space-y-2">
              {userEnrollments.map(en => {
                const course = courses.find(c => c.id === en.courseId);
                if (!course) return null;
                return (
                  <div key={en.id} className="flex items-center justify-between p-3 border border-red-900/20 bg-black/40 rounded-none">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">{course.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {en.status === 'completed' ? 'Completed' : `${en.progress}% complete`}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUnassignCourse(coursesModalUser.id, course.id, course.title)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-none ml-3"
                    >
                      <Icons.Trash className="h-4 w-4 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                );
              })}
              <div className="pt-3 mt-3 border-t border-red-900/20">
                <Button
                  onClick={() => {
                    setShowCoursesModal(false);
                    setSelectedUser(coursesModalUser.id);
                    setShowAssignModal(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-none"
                >
                  <Icons.Plus className="h-4 w-4 mr-2" />
                  Assign Another Course
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Credentials Modal - shown after creating a new user */}
      <Modal isOpen={showCredentialsModal} onClose={() => setShowCredentialsModal(false)} title="Trainee Created Successfully">
        {createdCredentials && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-900/30 rounded-lg">
              <Icons.Check className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">
                <span className="font-medium">{createdCredentials.name}</span> has been added to the system.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Share these login credentials with the trainee. They can use these to access the training portal.
              </p>

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-red-900/20 px-4 py-3 text-white font-mono text-sm">
                    {createdCredentials.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                    className="p-3 border border-red-900/20 hover:bg-red-900/10 transition-colors text-gray-400 hover:text-white"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Icons.Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Icons.Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-red-900/20 px-4 py-3 text-white font-mono text-sm">
                    {createdCredentials.password}
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                    className="p-3 border border-red-900/20 hover:bg-red-900/10 transition-colors text-gray-400 hover:text-white"
                    title="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <Icons.Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Icons.Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Copy all button */}
              <button
                onClick={() => copyToClipboard(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`, 'all')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-900/30 hover:bg-red-900/10 transition-colors text-gray-300 hover:text-white"
              >
                {copiedField === 'all' ? (
                  <>
                    <Icons.Check className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy className="h-4 w-4" />
                    <span>Copy All Credentials</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-red-900/20">
              <Button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCreatedCredentials(null);
                  showToast(`Trainee "${createdCredentials.name}" added successfully`, 'success');
                }}
                className="w-full rounded-none"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); setCsvData([]); setImportError(null); }} title="Import Trainees from CSV">
        <div className="space-y-6">
          <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              Upload a CSV file with the following columns: <strong>FirstName, LastName, Email</strong> (required), <strong>Source</strong> (optional)
            </p>
          </div>

          <div className="border-2 border-dashed border-red-900/30 hover:border-red-900/50 transition-colors p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Icons.Upload className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
              <p className="text-gray-600 text-xs mt-1">CSV files only</p>
            </label>
          </div>

          {importError && (
            <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
              <p className="text-red-300 text-sm">{importError}</p>
            </div>
          )}

          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Preview ({csvData.length} users)</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCsvData([]); setImportError(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  Clear
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-red-900/20 bg-black/40">
                <table className="w-full text-sm">
                  <thead className="bg-red-900/10 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Name</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Email</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((user, i) => (
                      <tr key={i} className="border-t border-red-900/10">
                        <td className="px-3 py-2 text-white">{user.firstName} {user.lastName}</td>
                        <td className="px-3 py-2 text-gray-400">{user.email}</td>
                        <td className="px-3 py-2 text-gray-400">{user.source || '-'}</td>
                      </tr>
                    ))}
                    {csvData.length > 10 && (
                      <tr className="border-t border-red-900/10">
                        <td colSpan={3} className="px-3 py-2 text-gray-500 text-center">
                          ...and {csvData.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleBulkImport}
              disabled={csvData.length === 0}
              className="flex-1 rounded-none"
            >
              Import {csvData.length > 0 ? `${csvData.length} Trainees` : 'Trainees'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowImportModal(false); setCsvData([]); setImportError(null); }}
              className="flex-1 rounded-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

// Admin Course Detail - Module & Lesson Management
const AdminCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses, modules, lessons, addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson } = useData();
  const { toast, showToast, closeToast } = useNotification();

  const course = courses.find(c => c.id === courseId);
  const courseModules = modules.filter(m => m.courseId === courseId).sort((a, b) => a.orderNumber - b.orderNumber);

  // Module state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '', orderNumber: courseModules.length + 1 });

  // Lesson state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [lessonFormError, setLessonFormError] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'content',
    content: '',
    orderNumber: 1,
    passingScore: 70,
    questions: []
  });

  const currentLessonEditor = editingLesson || newLesson;
  const currentPresentationEditor = currentLessonEditor.type === 'presentation'
    ? getLessonPresentation(currentLessonEditor as Lesson) || createEmptyPresentation()
    : null;

  if (!course) {
    return <div className="text-white">Course not found</div>;
  }

  // Module handlers
  const openAddModuleModal = () => {
    setNewModule({ title: '', description: '', orderNumber: courseModules.length + 1 });
    setEditingModule(null);
    setShowModuleModal(true);
  };

  const openEditModuleModal = (module: Module) => {
    setEditingModule(module);
    setShowModuleModal(true);
  };

  const saveModule = async () => {
    if (editingModule) {
      if (!editingModule.title) {
        showToast('Please enter a module title', 'error');
        return;
      }
      try {
        await updateModule(editingModule.id, editingModule);
        showToast('Module updated successfully', 'success');
      } catch (error) {
        showToast('Failed to update module', 'error');
        return;
      }
    } else {
      if (!newModule.title) {
        showToast('Please enter a module title', 'error');
        return;
      }
      try {
        await addModule({ ...newModule, courseId: courseId! });
        showToast('Module created successfully', 'success');
      } catch (error) {
        showToast('Failed to create module', 'error');
        return;
      }
    }
    setShowModuleModal(false);
    setEditingModule(null);
  };

  const handleDeleteModule = async (module: any) => {
    if (confirm(`Delete "${module.title}"? This will also delete all lessons in this module.`)) {
      try {
        await deleteModule(module.id);
        showToast('Module deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete module', 'error');
      }
    }
  };

  // Lesson handlers
  const openAddLessonModal = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    setSelectedModuleId(moduleId);
    setLessonFormError(null);
    setNewLesson({
      title: '',
      type: 'content',
      content: '',
      orderNumber: moduleLessons.length + 1,
      passingScore: 70,
      questions: []
    });
    setEditingLesson(null);
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setLessonFormError(null);
    setEditingLesson(lesson);
    setSelectedModuleId(lesson.moduleId);
    setShowLessonModal(true);
  };

  const updateLessonDraft = (changes: Partial<Lesson>) => {
    setLessonFormError(null);
    if (editingLesson) {
      setEditingLesson({ ...editingLesson, ...changes });
    } else {
      setNewLesson(prev => ({ ...prev, ...changes }));
    }
  };

  const updatePresentationDraft = (changes: Partial<PresentationLessonContent>) => {
    const nextPresentation = {
      ...(currentPresentationEditor || createEmptyPresentation()),
      ...changes
    };

    updateLessonDraft({
      content: serializePresentationLessonContent(nextPresentation)
    });
  };

  const handlePresentationFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setLessonFormError('Please upload a PDF file for presentations.');
      showToast('Please upload a PDF file for presentations', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > PRESENTATION_FILE_SIZE_LIMIT) {
      setLessonFormError('PDF is too large. Please keep presentation uploads under 10MB.');
      showToast('PDF is too large. Please keep presentation uploads under 10MB.', 'error');
      e.target.value = '';
      return;
    }

    try {
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      updateLessonDraft({
        content: serializePresentationLessonContent({
          kind: 'presentation_v1',
          sourceType: 'upload',
          fileName: file.name,
          fileDataUrl,
          mimeType: file.type
        })
      });

      showToast(`Attached "${file.name}" to this lesson`, 'success');
    } catch {
      setLessonFormError('Failed to process presentation file.');
      showToast('Failed to process presentation file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveLesson = async () => {
    if (editingLesson) {
      if (!editingLesson.title) {
        setLessonFormError('Please enter a lesson title.');
        showToast('Please enter a lesson title', 'error');
        return;
      }

      if (editingLesson.type === 'presentation') {
        const presentation = getLessonPresentation(editingLesson);
        const hasEmbed = presentation?.sourceType === 'embed' && presentation.embedUrl;
        const hasFile = presentation?.sourceType === 'upload' && presentation.fileDataUrl;

        if (!hasEmbed && !hasFile) {
          setLessonFormError('Please add an embed URL or upload a PDF for this presentation.');
          showToast('Please add an embed URL or upload a PDF for this presentation', 'error');
          return;
        }
      }

      try {
        await updateLesson(editingLesson.id, editingLesson);
        setLessonFormError(null);
        showToast('Lesson updated successfully', 'success');
      } catch (error: any) {
        const message = error?.message || 'Failed to update lesson.';
        setLessonFormError(message);
        showToast(message, 'error');
        return;
      }
    } else {
      if (!newLesson.title) {
        setLessonFormError('Please enter a lesson title.');
        showToast('Please enter a lesson title', 'error');
        return;
      }

      if (newLesson.type === 'presentation') {
        const presentation = getLessonPresentation(newLesson as Lesson);
        const hasEmbed = presentation?.sourceType === 'embed' && presentation.embedUrl;
        const hasFile = presentation?.sourceType === 'upload' && presentation.fileDataUrl;

        if (!hasEmbed && !hasFile) {
          setLessonFormError('Please add an embed URL or upload a PDF for this presentation.');
          showToast('Please add an embed URL or upload a PDF for this presentation', 'error');
          return;
        }
      }

      try {
        await addLesson({ ...(newLesson as Lesson), moduleId: selectedModuleId! });
        setLessonFormError(null);
        showToast('Lesson created successfully', 'success');
      } catch (error: any) {
        const message = error?.message || 'Failed to create lesson.';
        setLessonFormError(message);
        showToast(message, 'error');
        return;
      }
    }
    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = async (lesson: any) => {
    if (confirm(`Delete lesson "${lesson.title}"?`)) {
      try {
        await deleteLesson(lesson.id);
        showToast('Lesson deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete lesson', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} action={toast.action} />}

      {/* Course Header */}
      <div className="flex items-center gap-4 border-b border-red-900/20 pb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')} className="rounded-none">
          <Icons.ChevronLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <div className="border border-red-900/20 bg-[#0f121a]/60 p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-h2 font-archivo font-medium text-white mb-2">{course.title}</h1>
            <p className="text-gray-400 text-body1 mb-4">{course.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Badge className="rounded-none bg-white/5 border-white/10">{course.level}</Badge>
              <span>{course.duration} minutes</span>
              <span>•</span>
              <span>{courseModules.length} modules</span>
            </div>
          </div>
          <Button onClick={openAddModuleModal} className="rounded-none bg-red-600 hover:bg-red-700">
            <Icons.Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {courseModules.length === 0 ? (
          <div className="border border-red-900/20 bg-[#0f121a]/60 p-12 text-center">
            <Icons.BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No modules yet. Click "Add Module" to create the first module.</p>
          </div>
        ) : (
          courseModules.map((module, moduleIndex) => {
            const moduleLessons = lessons.filter(l => l.moduleId === module.id).sort((a, b) => a.orderNumber - b.orderNumber);
            return (
              <div key={module.id} className="border border-red-900/20 bg-[#0f121a]/60">
                {/* Module Header */}
                <div className="p-6 border-b border-red-900/20 bg-white/[0.02]">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-600 flex items-center justify-center font-bold font-archivo">
                        {module.orderNumber}
                      </div>
                      <div>
                        <h3 className="text-h5 font-archivo text-white mb-1">{module.title}</h3>
                        <p className="text-sm text-gray-400">{module.description}</p>
                        <p className="text-xs text-gray-600 mt-2">{moduleLessons.length} lessons</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openAddLessonModal(module.id)} className="rounded-none border border-white/10">
                        <Icons.Plus className="h-4 w-4 mr-2" />
                        Add Lesson
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModuleModal(module)} className="rounded-none border border-white/10">
                        <Icons.Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(module)} className="rounded-none border border-red-900/20 text-red-400">
                        <Icons.Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="p-6">
                  {moduleLessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No lessons yet. Click "Add Lesson" to create one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moduleLessons.map((lesson) => (
                        <div key={lesson.id} className="border border-white/10 bg-white/[0.02] p-4 hover:bg-white/5 transition-all">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-4 items-center flex-1">
                              <div className="text-caption text-gray-600 font-mono">
                                {lesson.orderNumber}
                              </div>
                              {lesson.type === 'quiz' ? (
                                <Icons.Award className="h-5 w-5 text-yellow-500" />
                              ) : lesson.type === 'presentation' ? (
                                <Icons.FileUp className="h-5 w-5 text-purple-400" />
                              ) : (
                                <Icons.FileText className="h-5 w-5 text-blue-400" />
                              )}
                              <div className="flex-1">
                                <h4 className="text-subtitle1 text-white">{lesson.title}</h4>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                  <Badge className="rounded-none bg-white/5 border-white/10">
                                    {lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'presentation' ? 'Presentation' : 'Content'}
                                  </Badge>
                                  {lesson.type === 'presentation' && (
                                    <span>Embedded in portal</span>
                                  )}
                                  {lesson.type === 'quiz' && lesson.questions && (
                                    <span>{lesson.questions.length} questions</span>
                                  )}
                                  {lesson.type === 'quiz' && lesson.passingScore && (
                                    <span>Passing: {lesson.passingScore}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditLessonModal(lesson)} className="rounded-none border border-white/10">
                                <Icons.Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson)} className="rounded-none border border-red-900/20 text-red-400">
                                <Icons.Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Module Modal */}
      <Modal
        isOpen={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        title={editingModule ? 'Edit Module' : 'Add Module'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Module Title *</label>
            <Input
              value={editingModule ? editingModule.title : newModule.title}
              onChange={(e) => editingModule
                ? setEditingModule({ ...editingModule, title: e.target.value })
                : setNewModule({ ...newModule, title: e.target.value })
              }
              placeholder="e.g., Introduction to Security Protocols"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
            <Textarea
              value={editingModule ? editingModule.description : newModule.description}
              onChange={(e) => editingModule
                ? setEditingModule({ ...editingModule, description: e.target.value })
                : setNewModule({ ...newModule, description: e.target.value })
              }
              placeholder="Brief description of module content"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Order Number</label>
            <Input
              type="number"
              value={editingModule ? editingModule.orderNumber : newModule.orderNumber}
              onChange={(e) => editingModule
                ? setEditingModule({ ...editingModule, orderNumber: parseInt(e.target.value) })
                : setNewModule({ ...newModule, orderNumber: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={saveModule} className="flex-1 rounded-none">
              {editingModule ? 'Update' : 'Create'} Module
            </Button>
            <Button variant="outline" onClick={() => setShowModuleModal(false)} className="flex-1 rounded-none">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setLessonFormError(null);
        }}
        title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {lessonFormError && (
            <div className="border border-red-900/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {lessonFormError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lesson Title *</label>
            <Input
              value={editingLesson ? editingLesson.title : newLesson.title}
              onChange={(e) => editingLesson
                ? setEditingLesson({ ...editingLesson, title: e.target.value })
                : setNewLesson({ ...newLesson, title: e.target.value })
              }
              placeholder="e.g., Understanding Threat Vectors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lesson Type *</label>
            <Select
              value={editingLesson ? editingLesson.type : newLesson.type}
              onChange={(e) => editingLesson
                ? setEditingLesson({ ...editingLesson, type: e.target.value as any })
                : setNewLesson({ ...newLesson, type: e.target.value })
              }
            >
              <option value="content">Content</option>
              <option value="presentation">Presentation</option>
              <option value="quiz">Quiz</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Order Number</label>
            <Input
              type="number"
              value={editingLesson ? editingLesson.orderNumber : newLesson.orderNumber}
              onChange={(e) => editingLesson
                ? setEditingLesson({ ...editingLesson, orderNumber: parseInt(e.target.value) })
                : setNewLesson({ ...newLesson, orderNumber: parseInt(e.target.value) })
              }
            />
          </div>

          {(editingLesson?.type === 'content' || newLesson.type === 'content') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Content (HTML) *</label>
              <Textarea
                rows={10}
                value={editingLesson ? editingLesson.content || '' : newLesson.content}
                onChange={(e) => editingLesson
                  ? setEditingLesson({ ...editingLesson, content: e.target.value })
                  : setNewLesson({ ...newLesson, content: e.target.value })
                }
                placeholder="<h2>Title</h2><p>Content here...</p>"
              />
              <p className="text-xs text-gray-500 mt-1">You can use HTML tags: h2, h3, p, ul, li, strong, em</p>
            </div>
          )}

          {(editingLesson?.type === 'presentation' || newLesson.type === 'presentation') && currentPresentationEditor && (
            <div className="space-y-4 border border-white/10 bg-white/[0.02] p-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Presentation Source *</label>
                <Select
                  value={currentPresentationEditor.sourceType}
                  onChange={(e) => updatePresentationDraft({
                    sourceType: e.target.value as PresentationSourceType,
                    embedUrl: e.target.value === 'embed' ? currentPresentationEditor.embedUrl || '' : '',
                    fileName: e.target.value === 'upload' ? currentPresentationEditor.fileName || '' : '',
                    fileDataUrl: e.target.value === 'upload' ? currentPresentationEditor.fileDataUrl || '' : '',
                    mimeType: e.target.value === 'upload' ? currentPresentationEditor.mimeType || '' : ''
                  })}
                >
                  <option value="embed">Embed Link</option>
                  <option value="upload">Upload PDF</option>
                </Select>
              </div>

              {currentPresentationEditor.sourceType === 'embed' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Embed URL *</label>
                  <Input
                    value={currentPresentationEditor.embedUrl || ''}
                    onChange={(e) => updatePresentationDraft({ embedUrl: e.target.value })}
                    placeholder="Paste the Gamma embed/share URL"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will open directly inside the training portal. Use a link that allows embedding where possible.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Presentation PDF *</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePresentationFileUpload}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white hover:file:bg-red-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF only. Current MVP stores the file with the lesson record, so keep it under 10MB.</p>
                  </div>

                  {currentPresentationEditor.fileName && (
                    <div className="flex items-center justify-between gap-4 border border-white/10 bg-black/20 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{currentPresentationEditor.fileName}</p>
                        <p className="text-xs text-gray-500">This file will display inside the lesson player.</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePresentationDraft({
                          fileName: '',
                          fileDataUrl: '',
                          mimeType: ''
                        })}
                        className="rounded-none border border-red-900/20 text-red-400"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(editingLesson?.type === 'quiz' || newLesson.type === 'quiz') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Passing Score (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingLesson ? editingLesson.passingScore || 70 : newLesson.passingScore}
                  onChange={(e) => editingLesson
                    ? setEditingLesson({ ...editingLesson, passingScore: parseInt(e.target.value) })
                    : setNewLesson({ ...newLesson, passingScore: parseInt(e.target.value) })
                  }
                />
              </div>

              {/* Quiz Question Builder */}
              {editingLesson && (
                <div className="border border-white/10 bg-white/[0.02] p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-subtitle1 text-white font-archivo">Quiz Questions</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const questions = editingLesson.questions || [];
                        const newQuestion = {
                          id: `q${Date.now()}`,
                          text: '',
                          type: 'single_choice' as const,
                          points: 10,
                          options: [
                            { id: `o${Date.now()}_1`, text: '', isCorrect: false },
                            { id: `o${Date.now()}_2`, text: '', isCorrect: false }
                          ],
                          explanation: ''
                        };
                        setEditingLesson({ ...editingLesson, questions: [...questions, newQuestion] });
                      }}
                      className="rounded-none border border-white/10"
                    >
                      <Icons.Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {(!editingLesson.questions || editingLesson.questions.length === 0) ? (
                    <p className="text-sm text-gray-500 text-center py-4">No questions yet. Click "Add Question" to create one.</p>
                  ) : (
                    <div className="space-y-4">
                      {editingLesson.questions.map((question, qIndex) => (
                        <div key={question.id} className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Question {qIndex + 1}</label>
                                <Input
                                  value={question.text}
                                  onChange={(e) => {
                                    const updatedQuestions = [...editingLesson.questions!];
                                    updatedQuestions[qIndex] = { ...question, text: e.target.value };
                                    setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                  }}
                                  placeholder="Enter your question..."
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                  <Select
                                    value={question.type}
                                    onChange={(e) => {
                                      const updatedQuestions = [...editingLesson.questions!];
                                      updatedQuestions[qIndex] = { ...question, type: e.target.value as any };
                                      setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                    }}
                                  >
                                    <option value="single_choice">Single Choice</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Points</label>
                                  <Input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => {
                                      const updatedQuestions = [...editingLesson.questions!];
                                      updatedQuestions[qIndex] = { ...question, points: parseInt(e.target.value) };
                                      setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-xs font-medium text-gray-500">Answer Options</label>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const updatedQuestions = [...editingLesson.questions!];
                                      const newOption = { id: `o${Date.now()}`, text: '', isCorrect: false };
                                      updatedQuestions[qIndex] = {
                                        ...question,
                                        options: [...question.options, newOption]
                                      };
                                      setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                    }}
                                    className="rounded-none text-xs h-6 px-2"
                                  >
                                    <Icons.Plus className="h-3 w-3 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={option.id} className="flex gap-2 items-center">
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                          const updatedQuestions = [...editingLesson.questions!];
                                          const updatedOptions = [...question.options];
                                          updatedOptions[optIndex] = { ...option, isCorrect: e.target.checked };
                                          updatedQuestions[qIndex] = { ...question, options: updatedOptions };
                                          setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                        }}
                                        className="flex-shrink-0"
                                      />
                                      <Input
                                        value={option.text}
                                        onChange={(e) => {
                                          const updatedQuestions = [...editingLesson.questions!];
                                          const updatedOptions = [...question.options];
                                          updatedOptions[optIndex] = { ...option, text: e.target.value };
                                          updatedQuestions[qIndex] = { ...question, options: updatedOptions };
                                          setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const updatedQuestions = [...editingLesson.questions!];
                                          updatedQuestions[qIndex] = {
                                            ...question,
                                            options: question.options.filter((_, i) => i !== optIndex)
                                          };
                                          setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                        }}
                                        className="rounded-none text-red-400 h-8 px-2"
                                      >
                                        <Icons.Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Check the box to mark correct answer(s)</p>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Explanation (Optional)</label>
                                <Textarea
                                  value={question.explanation || ''}
                                  onChange={(e) => {
                                    const updatedQuestions = [...editingLesson.questions!];
                                    updatedQuestions[qIndex] = { ...question, explanation: e.target.value };
                                    setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                                  }}
                                  placeholder="Explain the correct answer..."
                                  rows={2}
                                />
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updatedQuestions = editingLesson.questions!.filter((_, i) => i !== qIndex);
                                setEditingLesson({ ...editingLesson, questions: updatedQuestions });
                              }}
                              className="rounded-none text-red-400"
                            >
                              <Icons.Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Question Builder for New Lesson */}
              {!editingLesson && (
                <div className="border border-white/10 bg-white/[0.02] p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-subtitle1 text-white font-archivo">Quiz Questions</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const questions = newLesson.questions || [];
                        const newQuestion = {
                          id: `q${Date.now()}`,
                          text: '',
                          type: 'single_choice' as const,
                          points: 10,
                          options: [
                            { id: `o${Date.now()}_1`, text: '', isCorrect: false },
                            { id: `o${Date.now()}_2`, text: '', isCorrect: false }
                          ],
                          explanation: ''
                        };
                        setNewLesson({ ...newLesson, questions: [...questions, newQuestion] });
                      }}
                      className="rounded-none border border-white/10"
                    >
                      <Icons.Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {(!newLesson.questions || newLesson.questions.length === 0) ? (
                    <p className="text-sm text-gray-500 text-center py-4">No questions yet. Click "Add Question" to create one.</p>
                  ) : (
                    <div className="space-y-4">
                      {newLesson.questions.map((question: any, qIndex: number) => (
                        <div key={question.id} className="border border-white/10 bg-white/[0.02] p-4 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Question {qIndex + 1}</label>
                                <Input
                                  value={question.text}
                                  onChange={(e) => {
                                    const updatedQuestions = [...newLesson.questions];
                                    updatedQuestions[qIndex] = { ...question, text: e.target.value };
                                    setNewLesson({ ...newLesson, questions: updatedQuestions });
                                  }}
                                  placeholder="Enter your question..."
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                  <Select
                                    value={question.type}
                                    onChange={(e) => {
                                      const updatedQuestions = [...newLesson.questions];
                                      updatedQuestions[qIndex] = { ...question, type: e.target.value };
                                      setNewLesson({ ...newLesson, questions: updatedQuestions });
                                    }}
                                  >
                                    <option value="single_choice">Single Choice</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Points</label>
                                  <Input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => {
                                      const updatedQuestions = [...newLesson.questions];
                                      updatedQuestions[qIndex] = { ...question, points: parseInt(e.target.value) };
                                      setNewLesson({ ...newLesson, questions: updatedQuestions });
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className="block text-xs font-medium text-gray-500">Answer Options</label>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const updatedQuestions = [...newLesson.questions];
                                      const newOption = { id: `o${Date.now()}`, text: '', isCorrect: false };
                                      updatedQuestions[qIndex] = {
                                        ...question,
                                        options: [...question.options, newOption]
                                      };
                                      setNewLesson({ ...newLesson, questions: updatedQuestions });
                                    }}
                                    className="rounded-none text-xs h-6 px-2"
                                  >
                                    <Icons.Plus className="h-3 w-3 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {question.options.map((option: any, optIndex: number) => (
                                    <div key={option.id} className="flex gap-2 items-center">
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                          const updatedQuestions = [...newLesson.questions];
                                          const updatedOptions = [...question.options];
                                          updatedOptions[optIndex] = { ...option, isCorrect: e.target.checked };
                                          updatedQuestions[qIndex] = { ...question, options: updatedOptions };
                                          setNewLesson({ ...newLesson, questions: updatedQuestions });
                                        }}
                                        className="flex-shrink-0"
                                      />
                                      <Input
                                        value={option.text}
                                        onChange={(e) => {
                                          const updatedQuestions = [...newLesson.questions];
                                          const updatedOptions = [...question.options];
                                          updatedOptions[optIndex] = { ...option, text: e.target.value };
                                          updatedQuestions[qIndex] = { ...question, options: updatedOptions };
                                          setNewLesson({ ...newLesson, questions: updatedQuestions });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const updatedQuestions = [...newLesson.questions];
                                          updatedQuestions[qIndex] = {
                                            ...question,
                                            options: question.options.filter((_: any, i: number) => i !== optIndex)
                                          };
                                          setNewLesson({ ...newLesson, questions: updatedQuestions });
                                        }}
                                        className="rounded-none text-red-400 h-8 px-2"
                                      >
                                        <Icons.Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Check the box to mark correct answer(s)</p>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Explanation (Optional)</label>
                                <Textarea
                                  value={question.explanation || ''}
                                  onChange={(e) => {
                                    const updatedQuestions = [...newLesson.questions];
                                    updatedQuestions[qIndex] = { ...question, explanation: e.target.value };
                                    setNewLesson({ ...newLesson, questions: updatedQuestions });
                                  }}
                                  placeholder="Explain the correct answer..."
                                  rows={2}
                                />
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updatedQuestions = newLesson.questions.filter((_: any, i: number) => i !== qIndex);
                                setNewLesson({ ...newLesson, questions: updatedQuestions });
                              }}
                              className="rounded-none text-red-400"
                            >
                              <Icons.Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSaveLesson} className="flex-1 rounded-none">
              {editingLesson ? 'Update' : 'Create'} Lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowLessonModal(false);
                setLessonFormError(null);
              }}
              className="flex-1 rounded-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Admin Live Sessions Management
const AdminLiveSessions = () => {
  const { liveSessions, addLiveSession, updateLiveSession, deleteLiveSession } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingLink: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'upcoming' as 'upcoming' | 'live' | 'completed'
  });
  const { showToast } = useNotification();

  const handleOpenModal = (session?: any) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        title: session.title,
        description: session.description,
        meetingLink: session.meetingLink,
        scheduledDate: session.scheduledDate,
        scheduledTime: session.scheduledTime,
        status: session.status
      });
    } else {
      setEditingSession(null);
      setFormData({
        title: '',
        description: '',
        meetingLink: '',
        scheduledDate: '',
        scheduledTime: '',
        status: 'upcoming'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.meetingLink || !formData.scheduledDate || !formData.scheduledTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingSession) {
        await updateLiveSession(editingSession.id, formData);
        showToast('Live session updated successfully', 'success');
      } else {
        await addLiveSession(formData);
        showToast('Live session created successfully', 'success');
      }
      setShowModal(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to save live session', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this live session?')) {
      try {
        await deleteLiveSession(id);
        showToast('Live session deleted successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to delete live session', 'error');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 font-archivo text-white mb-2">Live Sessions</h1>
          <p className="text-gray-400">Manage live training sessions and virtual classes.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()} className="rounded-none">
          <Icons.Plus className="h-4 w-4 mr-2" />
          Create Session
        </Button>
      </div>

      {liveSessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveSessions.map(session => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 rounded-lg p-3">
                    <Icons.Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-h5 font-archivo text-white font-bold">{session.title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {session.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(session)}>
                    <Icons.Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)} className="text-red-400">
                    <Icons.Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 text-body2 mb-4">{session.description}</p>
              <div className="space-y-2 text-caption text-gray-400">
                <p><strong className="text-white">Date:</strong> {new Date(session.scheduledDate).toLocaleDateString()}</p>
                <p><strong className="text-white">Time:</strong> {session.scheduledTime}</p>
                <p><strong className="text-white">Link:</strong> <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{session.meetingLink}</a></p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.Video className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Live Sessions</h3>
          <p className="text-gray-400 mb-8">Create your first live session to get started.</p>
          <Button variant="primary" onClick={() => handleOpenModal()} className="rounded-none">
            Create Session
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSession ? 'Edit Live Session' : 'Create Live Session'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Session title"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Session description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meeting Link *</label>
              <Input
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date *</label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time *</label>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'live' | 'completed' })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 rounded-none" onClick={handleSubmit}>
                {editingSession ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Admin Exams Management
const AdminExams = () => {
  const { exams, users, deleteExam } = useData();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam? All attempts will also be deleted.')) {
      try {
        await deleteExam(id);
        showToast('Exam deleted successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to delete exam', 'error');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 font-archivo text-white mb-2">Exams</h1>
          <p className="text-gray-400">Manage exams and assessments for trainees.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/exams/create')} className="rounded-none">
          <Icons.Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map(exam => (
            <Card key={exam.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 rounded-lg p-3">
                    <Icons.Clipboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-h5 font-archivo text-white font-bold">{exam.title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {exam.questions.length} questions
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/exams/${exam.id}`)}>
                    <Icons.Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)} className="text-red-400">
                    <Icons.Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 text-body2 mb-4">{exam.description}</p>
              <div className="grid grid-cols-2 gap-4 text-caption text-gray-400 mb-4">
                <div>
                  <strong className="text-white">Duration:</strong> {exam.totalTimeMinutes} min
                </div>
                <div>
                  <strong className="text-white">Passing:</strong> {exam.passingScore}%
                </div>
                <div>
                  <strong className="text-white">Max Attempts:</strong> {exam.maxAttempts === 999 ? '∞' : exam.maxAttempts}
                </div>
                <div>
                  <strong className="text-white">Assigned To:</strong> {exam.assignedTo.length === 0 ? 'All' : exam.assignedTo.length}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Icons.Clipboard className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-h4 font-archivo text-white mb-3">No Exams</h3>
          <p className="text-gray-400 mb-8">Create your first exam to get started.</p>
          <Button variant="primary" onClick={() => navigate('/admin/exams/create')} className="rounded-none">
            Create Exam
          </Button>
        </div>
      )}
    </div>
  );
};

const AdminSettings = () => (
  <div className="p-8">
    <h1 className="text-h2 font-archivo text-white mb-4">System Settings</h1>
    <p className="text-gray-300">System settings coming soon.</p>
  </div>
);

// Admin Exam Create/Edit Component
const AdminExamCreate = () => {
  const { examId } = useParams<{ examId: string }>();
  const { exams, users, addExam, updateExam } = useData();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const existingExam = examId ? exams.find(e => e.id === examId) : null;

  const [formData, setFormData] = useState({
    title: existingExam?.title || '',
    description: existingExam?.description || '',
    totalTimeMinutes: existingExam?.totalTimeMinutes || 30,
    timePerQuestionSeconds: existingExam?.timePerQuestionSeconds || 60,
    passingScore: existingExam?.passingScore || 70,
    maxAttempts: existingExam?.maxAttempts || 3,
    randomizeQuestions: existingExam?.randomizeQuestions || false,
    randomizeAnswers: existingExam?.randomizeAnswers || false,
    showAnswersAfter: existingExam?.showAnswersAfter || true,
    assignedTo: existingExam?.assignedTo || [] as string[],
  });

  const [questions, setQuestions] = useState<Array<{
    id: string;
    question: string;
    type: 'single_choice' | 'multiple_choice';
    points: number;
    timeLimitSeconds?: number;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
  }>>(existingExam?.questions || []);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'single_choice' as 'single_choice' | 'multiple_choice',
    points: 10,
    timeLimitSeconds: undefined as number | undefined,
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
    ] as Array<{ id: string; text: string; isCorrect: boolean }>,
  });

  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setCurrentQuestion({
      question: '',
      type: 'single_choice',
      points: 10,
      timeLimitSeconds: undefined,
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
      ],
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    const q = questions[index];
    setCurrentQuestion({
      question: q.question,
      type: q.type,
      points: q.points,
      timeLimitSeconds: q.timeLimitSeconds,
      options: q.options.map(opt => ({ ...opt })),
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (index: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.text.trim())) {
      showToast('Please fill in all answer options', 'error');
      return;
    }
    if (!currentQuestion.options.some(opt => opt.isCorrect)) {
      showToast('Please mark at least one correct answer', 'error');
      return;
    }

    const newQuestion = {
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : Math.random().toString(36).substr(2, 9),
      ...currentQuestion,
    };

    if (editingQuestionIndex !== null) {
      const updated = [...questions];
      updated[editingQuestionIndex] = newQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    setShowQuestionModal(false);
  };

  const handleAddOption = () => {
    if (currentQuestion.options.length >= 6) {
      showToast('Maximum 6 options allowed', 'error');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      showToast('Minimum 2 options required', 'error');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updated = [...currentQuestion.options];
    if (field === 'isCorrect' && currentQuestion.type === 'single_choice') {
      // For single choice, uncheck all others
      updated.forEach((opt, i) => {
        opt.isCorrect = i === index ? (value as boolean) : false;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setCurrentQuestion({ ...currentQuestion, options: updated });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast('Please enter an exam title', 'error');
      return;
    }
    if (questions.length === 0) {
      showToast('Please add at least one question', 'error');
      return;
    }

    const examData = {
      ...formData,
      questions,
    };

    try {
      if (existingExam) {
        await updateExam(existingExam.id, examData);
        showToast('Exam updated successfully', 'success');
      } else {
        await addExam(examData);
        showToast('Exam created successfully', 'success');
      }
      navigate('/admin/exams');
    } catch (error: any) {
      showToast(error.message || 'Failed to save exam', 'error');
    }
  };

  const trainees = users.filter(u => u.role === 'user');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/admin/exams')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
          <Icons.ArrowLeft className="h-4 w-4" />
          Back to Exams
        </button>
        <h1 className="text-h2 font-archivo text-white mb-2">{existingExam ? 'Edit Exam' : 'Create New Exam'}</h1>
        <p className="text-gray-400">Set up exam details, questions, and time limits for anti-cheating.</p>
      </div>

      {/* Basic Settings */}
      <Card className="p-6 mb-6">
        <h2 className="text-h5 font-archivo text-white mb-4 flex items-center gap-2">
          <Icons.Settings className="h-5 w-5 text-red-600" />
          Exam Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Exam Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Security Fundamentals Assessment"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the exam"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Total Time (min)</label>
              <Input
                type="number"
                min={1}
                value={formData.totalTimeMinutes}
                onChange={(e) => setFormData({ ...formData, totalTimeMinutes: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Time/Question (sec)</label>
              <Input
                type="number"
                min={10}
                value={formData.timePerQuestionSeconds}
                onChange={(e) => setFormData({ ...formData, timePerQuestionSeconds: parseInt(e.target.value) || 60 })}
              />
              <p className="text-xs text-gray-500 mt-1">Anti-cheat timer</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Passing Score (%)</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Attempts</label>
              <Input
                type="number"
                min={1}
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-gray-300">Randomize Questions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.randomizeAnswers}
                onChange={(e) => setFormData({ ...formData, randomizeAnswers: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-gray-300">Randomize Answers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAnswersAfter}
                onChange={(e) => setFormData({ ...formData, showAnswersAfter: e.target.checked })}
                className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-gray-300">Show Answers After Submission</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h5 font-archivo text-white flex items-center gap-2">
            <Icons.List className="h-5 w-5 text-red-600" />
            Questions ({questions.length})
          </h2>
          <Button variant="outline" size="sm" onClick={handleAddQuestion} className="rounded-none">
            <Icons.Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-400 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{q.question}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>{q.type === 'single_choice' ? 'Single' : 'Multiple'} Choice</span>
                    <span>{q.points} pts</span>
                    {q.timeLimitSeconds && <span>{q.timeLimitSeconds}s limit</span>}
                    <span>{q.options.length} options</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(index)}>
                    <Icons.Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(index)} className="text-red-400">
                    <Icons.Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icons.HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No questions added yet. Click "Add Question" to create your first question.</p>
          </div>
        )}
      </Card>

      {/* Assignment (Optional) */}
      <Card className="p-6 mb-6">
        <h2 className="text-h5 font-archivo text-white mb-4 flex items-center gap-2">
          <Icons.Users className="h-5 w-5 text-red-600" />
          Assignment (Optional)
        </h2>
        <p className="text-sm text-gray-400 mb-4">Leave empty to make exam available to all trainees.</p>
        <div className="flex flex-wrap gap-2">
          {trainees.map(user => (
            <label key={user.id} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={formData.assignedTo.includes(user.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, assignedTo: [...formData.assignedTo, user.id] });
                  } else {
                    setFormData({ ...formData, assignedTo: formData.assignedTo.filter(id => id !== user.id) });
                  }
                }}
                className="rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-gray-300">{user.firstName} {user.lastName}</span>
            </label>
          ))}
          {trainees.length === 0 && (
            <p className="text-gray-500 text-sm">No trainees available</p>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 rounded-none" onClick={() => navigate('/admin/exams')}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1 rounded-none" onClick={handleSubmit}>
          {existingExam ? 'Update Exam' : 'Create Exam'}
        </Button>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <Modal
          isOpen={showQuestionModal}
          onClose={() => setShowQuestionModal(false)}
          title={editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Question *</label>
              <Textarea
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                placeholder="Enter your question"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <Select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as 'single_choice' | 'multiple_choice' })}
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Points</label>
                <Input
                  type="number"
                  min={1}
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Time Limit (seconds) - Optional</label>
              <Input
                type="number"
                min={0}
                value={currentQuestion.timeLimitSeconds || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimitSeconds: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Leave empty to use exam default"
              />
              <p className="text-xs text-gray-500 mt-1">Override the default time per question for this specific question</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-gray-400">Answer Options *</label>
                <Button variant="ghost" size="sm" onClick={handleAddOption} className="rounded-none">
                  <Icons.Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type={currentQuestion.type === 'single_choice' ? 'radio' : 'checkbox'}
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                        className="mr-2 text-green-500 focus:ring-green-500"
                      />
                    </label>
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveOption(index)} className="text-red-400">
                      <Icons.X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Check the box/radio next to the correct answer(s)</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => setShowQuestionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1 rounded-none" onClick={handleSaveQuestion}>
                {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const DataLoadErrorBanner = () => {
  const { dataLoadError } = useData();
  if (!dataLoadError) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-900/95 backdrop-blur-sm border-b border-red-500/40 text-white px-4 py-2 text-center text-sm">
      <span className="font-medium">Data load error:</span> {dataLoadError}
      <button
        onClick={() => window.location.reload()}
        className="ml-3 underline hover:text-red-200"
      >
        Reload
      </button>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  return (
    <ErrorBoundary>
    <DataProvider>
      <Router>
        <ScrollToTop />
        <DataLoadErrorBanner />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Portal */}
          {/* Course Player - Fullscreen without layout */}
          <Route path="/portal/course/:courseId" element={
            <ProtectedRoute role="user">
              <CoursePlayer />
            </ProtectedRoute>
          } />

          {/* Student Portal - With Layout */}
          <Route path="/portal/*" element={
            <ProtectedRoute role="user">
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentTraining />} />
                  <Route path="live-sessions" element={<StudentLiveSessions />} />
                  <Route path="exams" element={<StudentExams />} />
                  <Route path="exam/:examId" element={<ExamTaking />} />
                  <Route path="certifications" element={<StudentCertifications />} />
                  <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
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
                  <Route path="courses/:courseId" element={<AdminCourseDetail />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="live-sessions" element={<AdminLiveSessions />} />
                  <Route path="exams/create" element={<AdminExamCreate />} />
                  <Route path="exams/:examId" element={<AdminExamCreate />} />
                  <Route path="exams" element={<AdminExams />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DataProvider>
    </ErrorBoundary>
  );
};

export default App;

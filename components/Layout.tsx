import React from 'react';
import { Dumbbell, Menu, X, LogOut, User, Home, LogIn, Facebook, Instagram } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { AuthState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  auth: AuthState;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

// ✅ Image-based RoyalLogo — fills the entire container
export const RoyalLogo = ({ 
  className = "w-8 h-8",
  color = "#10b981" // ignored for images, kept for compatibility
}: { 
  className?: string; 
  color?: string;
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="https://i.ibb.co/YFRBBfxQ/Photoroom-20251229-174039.png"
        alt="ROYAL FITNESS"
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, auth, onLogout, currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavLink = ({ page, label, icon: Icon }: { page: string, label: string, icon: any }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        currentPage === page 
          ? 'bg-royal-600 text-white shadow-lg shadow-royal-900/40' 
          : 'text-gray-400 hover:bg-zinc-800 hover:text-royal-500'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navbar */}
      <nav className="bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => onNavigate(auth.isAuthenticated ? 'dashboard' : 'home')}
            >
              <div className="bg-royal-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <RoyalLogo className="text-white w-7 h-7" color="white" />
              </div>
              <span className="text-2xl font-black text-white">ROYAL <span className="text-royal-500">FITNESS</span></span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {!auth.isAuthenticated && <NavLink page="home" label="الرئيسية" icon={Home} />}
              
              {auth.isAuthenticated ? (
                <>
                  <NavLink page="dashboard" label="لوحة التحكم" icon={User} />
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors font-bold"
                  >
                    <LogOut size={18} />
                    <span>خروج</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-8 py-2.5 bg-royal-600 hover:bg-royal-500 text-white rounded-full font-black transition-all shadow-xl shadow-royal-900/20"
                >
                  <LogIn size={18} />
                  <span>دخول الأبطال</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 space-y-2 animate-in slide-in-from-top-2">
            {!auth.isAuthenticated && <NavLink page="home" label="الرئيسية" icon={Home} />}
            <div className="h-px bg-zinc-800 my-2"></div>
            {auth.isAuthenticated ? (
              <>
                <NavLink page="dashboard" label="لوحة التحكم" icon={User} />
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 bg-red-900/20 rounded-lg"
                >
                  <LogOut size={18} />
                  <span>تسجيل خروج</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-royal-600 text-white rounded-lg font-bold"
              >
                <LogIn size={18} />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

{/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-14 text-gray-400">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-right items-start">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex justify-end items-center gap-2">
              <span className="text-xl font-black text-white">
                ROYAL <span className="text-royal-500">FITNESS</span>
              </span>
              <RoyalLogo className="w-7 h-7" />
            </div>
            <p className="text-sm max-w-xs ml-auto">
              وجهتك الأولى للوصول إلى أفضل نسخة من نفسك. تدريب احترافي، معدات عالمية، وبيئة محفزة.
            </p>
            <div className="flex justify-end gap-3">
              <a href="https://www.facebook.com/share/17r6bmrm11/?mibextid=wwXIfr" className="p-2 bg-zinc-900 rounded-full"><Facebook size={18} /></a>
              <a href="https://www.instagram.com/royal_fitnessjo?igsh=ODV0bDh0cTl2dWU0&utm_source=qr" className="p-2 bg-zinc-900 rounded-full"><Instagram size={18} /></a>
              <a href="https://wa.me/96262229948" className="p-2 bg-zinc-900 rounded-full"><SiWhatsapp size={18} /></a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold mb-6 text-center">ساعات العمل</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">

              {/* Men */}
              <div>
                <h5 className="text-royal-500 font-bold mb-4 text-center">الرجال</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    ['Saturday', '3:00PM - 1:00AM'],
                    ['Sunday', '3:00PM - 1:00AM'],
                    ['Monday', '3:00PM - 1:00AM'],
                    ['Tuesday', '3:00PM - 1:00AM'],
                    ['Wednesday', '3:00PM - 1:00AM'],
                    ['Thursday', '3:00PM - 10:00AM'],
                    ['Friday', '2:00PM - 7:00PM'],
                  ].map(([day, time]) => (
                    <li key={day} className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>{day}</span>
                      <span className="text-white font-bold">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Women */}
              <div>
                <h5 className="text-pink-400 font-bold mb-4 text-center">السيدات</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    ['Saturday', '7:00AM - 3:00PM'],
                    ['Sunday', '7:00AM - 3:00PM'],
                    ['Monday', '7:00AM - 3:00PM'],
                    ['Tuesday', '7:00AM - 3:00PM'],
                    ['Wednesday', '7:00AM - 3:00PM'],
                    ['Thursday', '7:00AM - 3:00PM'],
                    ['Friday', 'Holiday'],
                  ].map(([day, time]) => (
                    <li key={day} className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>{day}</span>
                      <span className="text-white font-bold">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li>عمان - دوار التطبيقية</li>
              <li className="text-royal-500 font-bold">062229948</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          © 2024 ROYAL FITNESS PREMIUM CLUB. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

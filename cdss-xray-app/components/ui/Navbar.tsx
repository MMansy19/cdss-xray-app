'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { Menu, X, LogOut, Github } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Analyze', href: '/analyze', protected: true },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActiveLink = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/logo3.png" 
                  alt="CDSS X-Ray Logo" 
                  width={32} 
                  height={32} 
                  className="rounded-md"
                />
                <span className="font-bold text-xl text-blue-600 dark:text-blue-400">CDSS X-Ray</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navLinks.map((link) => 
                  (!link.protected || isAuthenticated) && (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={classNames(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        {
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200': isActiveLink(link.href),
                          'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': !isActiveLink(link.href)
                        }
                      )}
                    >
                      {link.name}
                    </Link>
                  )
                )}
                <a 
                  href="https://github.com/MMansy19/cdss-xray-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center transition-colors"
                >
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
          
          {/* Right side: auth only */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {user?.name || user?.username}
                </span>
                <button 
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={classNames('md:hidden transition-all duration-300 ease-in-out', {
        'max-h-screen opacity-100': mobileMenuOpen,
        'max-h-0 opacity-0 overflow-hidden': !mobileMenuOpen
      })}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => 
            (!link.protected || isAuthenticated) && (
              <Link 
                key={link.name} 
                href={link.href}
                className={classNames(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  {
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200': isActiveLink(link.href),
                    'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700': !isActiveLink(link.href)
                  }
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          )}
          
          <a 
            href="https://github.com/MMansy19/cdss-xray-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Github className="h-5 w-5 mr-2" />
            GitHub Repository
          </a>
          
          {isAuthenticated ? (
            <button 
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center w-full space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link 
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
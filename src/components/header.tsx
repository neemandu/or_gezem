'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  href: string;
  label: string;
  roles: Array<'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER'>;
}

const navigationItems: NavItem[] = [
  {
    href: '/data',
    label: 'דיווחים',
    roles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    href: '/report',
    label: 'דיווח',
    roles: ['DRIVER'],
  },
  {
    href: '/settings',
    label: 'הגדרות',
    roles: ['ADMIN'],
  },
];

export function Header() {
  const { user, signOut, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'מנהל מערכת';
      case 'SETTLEMENT_USER':
        return 'משתמש יישוב';
      case 'DRIVER':
        return 'נהג';
      default:
        return role;
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const closeSheet = () => setIsSheetOpen(false);

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 space-x-reverse font-bold text-xl text-primary"
        >
          <span>א.ו.ר גזם בע&quot;מ</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - User menu and mobile menu */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start space-x-2 space-x-reverse p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-xs text-text-secondary">
                    {getRoleDisplayName(user.role)}
                  </p>
                  {user.settlement && (
                    <p className="text-xs text-text-secondary">
                      {user.settlement.name}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 ml-2 h-4 w-4" />
                <span>יציאה</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden h-8 w-8 p-0"
                size="sm"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">פתח תפריט ניווט</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-right">תפריט ניווט</SheetTitle>
                <SheetDescription className="text-right">
                  בחר את הדף הרצוי
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-4">
                {/* User Info in Mobile Menu */}
                <div className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-primary-gray-100">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getUserInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                    <span className="text-xs text-text-secondary">
                      {getRoleDisplayName(user.role)}
                    </span>
                    {user.settlement && (
                      <span className="text-xs text-text-secondary">
                        {user.settlement.name}
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSheet}
                      className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg transition-colors hover:bg-primary-blue-200 ${
                        pathname === item.href
                          ? 'bg-primary-blue-200 text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>

                <Separator />

                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  className="justify-start text-right space-x-2 space-x-reverse"
                  onClick={() => {
                    closeSheet();
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>יציאה</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

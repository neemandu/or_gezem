'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Building,
  Phone,
  Bell,
  Settings,
} from 'lucide-react';
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
import { getRoleDisplayName } from '@/lib/auth-utils';

interface NavItem {
  href: string;
  label: string;
  roles: Array<'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER'>;
}

const navigationItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'דשבורד',
    roles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    href: '/reports',
    label: 'דיווחים',
    roles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    href: '/my-reports',
    label: 'הדיווחים שלי',
    roles: ['DRIVER'],
  },
  {
    href: '/report',
    label: 'דיווח חדש',
    roles: ['DRIVER'],
  },
  {
    href: '/pricing',
    label: 'מחירים',
    roles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    href: '/analytics',
    label: 'ניתוח נתונים',
    roles: ['ADMIN'],
  },
  {
    href: '/settings',
    label: 'הגדרות',
    roles: ['ADMIN'],
  },
];

export function Header() {
  const { user, userDetails, signOut, hasRole } = useAuth();
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

  const getUserDisplayName = () => {
    if (userDetails?.first_name && userDetails?.last_name) {
      return `${userDetails.first_name} ${userDetails.last_name}`;
    }
    if (userDetails?.first_name) {
      return userDetails.first_name;
    }
    return userDetails?.email || user?.email || '';
  };

  const getUserInitials = () => {
    if (userDetails?.first_name && userDetails?.last_name) {
      return `${userDetails.first_name[0]}${userDetails.last_name[0]}`.toUpperCase();
    }
    if (userDetails?.first_name) {
      return userDetails.first_name[0].toUpperCase();
    }
    return (userDetails?.email || user?.email || '')
      .substring(0, 2)
      .toUpperCase();
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
          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {/* Notification indicator - you can add logic to show unread count */}
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <div className="flex items-center justify-start space-x-2 space-x-reverse p-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{getUserDisplayName()}</p>
                  <p className="text-xs text-text-secondary">
                    {userDetails?.email}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {userDetails?.role
                      ? getRoleDisplayName(userDetails.role)
                      : ''}
                  </p>
                  {userDetails?.settlement && (
                    <div className="flex items-center space-x-1 space-x-reverse mt-1">
                      <Building className="h-3 w-3 text-text-secondary" />
                      <p className="text-xs text-text-secondary">
                        {userDetails.settlement.name}
                      </p>
                    </div>
                  )}
                  {userDetails?.phone && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Phone className="h-3 w-3 text-text-secondary" />
                      <p className="text-xs text-text-secondary">
                        {userDetails.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center">
                  <Bell className="mr-2 ml-2 h-4 w-4" />
                  <span>התראות</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex items-center">
                  <User className="mr-2 ml-2 h-4 w-4" />
                  <span>פרופיל משתמש</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 ml-2 h-4 w-4" />
                  <span>הגדרות מערכת</span>
                </Link>
              </DropdownMenuItem>
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
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {userDetails?.email}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {userDetails?.role
                        ? getRoleDisplayName(userDetails.role)
                        : ''}
                    </span>
                    {userDetails?.settlement && (
                      <div className="flex items-center space-x-1 space-x-reverse mt-1">
                        <Building className="h-3 w-3 text-text-secondary" />
                        <span className="text-xs text-text-secondary">
                          {userDetails.settlement.name}
                        </span>
                      </div>
                    )}
                    {userDetails?.phone && (
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Phone className="h-3 w-3 text-text-secondary" />
                        <span className="text-xs text-text-secondary">
                          {userDetails.phone}
                        </span>
                      </div>
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

                  {/* Notifications Link */}
                  <Link
                    href="/notifications"
                    onClick={closeSheet}
                    className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg transition-colors hover:bg-primary-blue-200 ${
                      pathname === '/notifications'
                        ? 'bg-primary-blue-200 text-primary font-medium'
                        : 'text-text-secondary'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>התראות</span>
                  </Link>
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

'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center space-x-1 space-x-reverse text-sm text-text-secondary ${className}`}
      aria-label="ניווט דרושות"
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronLeft className="h-4 w-4 mx-1 text-text-secondary" />
          )}
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="hover:text-text-primary transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`${item.isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

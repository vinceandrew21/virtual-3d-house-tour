'use client';

import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  breadcrumbs: Breadcrumb[];
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AdminPageHeader({ breadcrumbs, title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div className="admin-breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span className="admin-breadcrumb-sep">/</span>}
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
      <div className="admin-page-title-row">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {description && <p className="admin-page-description">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

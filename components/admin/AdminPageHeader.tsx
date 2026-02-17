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
  // Find the last breadcrumb with an href as the back link
  const backCrumb = [...breadcrumbs].reverse().find(c => c.href);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {backCrumb?.href && (
            <Link href={backCrumb.href} className="admin-back-btn" aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="admin-page-title">{title}</h1>
            {description && <p className="admin-page-description">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

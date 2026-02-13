import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import './admin.css';

export const metadata = {
  title: 'Admin | Virtual Tours',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGate>
  );
}

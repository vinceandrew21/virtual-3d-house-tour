'use client';

import { useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TourForm from '@/components/admin/TourForm';

export default function NewTourPage() {
  const router = useRouter();

  const handleSubmit = async (values: { name: string; description: string; author?: string }) => {
    const res = await fetch('/api/admin/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/admin/tours/${data.data.id}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'New Tour' },
        ]}
        title="Create New Tour"
        description="Add a new property or unit for virtual touring"
      />
      <TourForm onSubmit={handleSubmit} submitLabel="Create Tour" />
    </>
  );
}

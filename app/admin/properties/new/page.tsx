'use client';

import { useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import PropertyForm from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  const router = useRouter();

  const handleSubmit = async (values: {
    name: string;
    address?: string;
    clientName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
  }) => {
    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/admin/properties/${data.data.id}`);
    }
  };

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'New Property' },
        ]}
        title="Create New Property"
        description="Add a new property, unit, or client to organize your virtual tours"
      />
      <PropertyForm onSubmit={handleSubmit} submitLabel="Create Property" />
    </>
  );
}

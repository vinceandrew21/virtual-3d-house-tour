'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TourForm from '@/components/admin/TourForm';
import { Property } from '@/types/admin';

export default function NewTourInPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetch(`/api/admin/properties/${propertyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setProperty(data.data);
      });
  }, [propertyId]);

  const handleSubmit = async (values: { name: string; description: string; author?: string }) => {
    const res = await fetch(`/api/admin/properties/${propertyId}/tours`, {
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
          { label: property?.name || 'Property', href: `/admin/properties/${propertyId}` },
          { label: 'New Tour' },
        ]}
        title="Create New Tour"
        description={`Add a new virtual tour to ${property?.name || 'this property'}`}
      />
      <TourForm onSubmit={handleSubmit} submitLabel="Create Tour" />
    </>
  );
}

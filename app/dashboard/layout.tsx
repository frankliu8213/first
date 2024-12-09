import DashboardNav from '@/app/dashboard/components/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <DashboardNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
} 
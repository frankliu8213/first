'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', label: '数据概览' },
  { href: '/dashboard/sales', label: '销售分析' },
  { href: '/dashboard/inventory', label: '库存管理' },
  { href: '/dashboard/market', label: '市场分析' },
  { href: '/dashboard/products', label: '产品管理' },
  { href: '/dashboard/suppliers', label: '供应商管理' },
  { href: '/dashboard/users', label: '用户管理' },
  { href: '/dashboard/settings', label: '系统设置' },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="w-64 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col h-screen">
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-md ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      <button
        onClick={logout}
        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
      >
        退出登录
      </button>
    </nav>
  );
} 
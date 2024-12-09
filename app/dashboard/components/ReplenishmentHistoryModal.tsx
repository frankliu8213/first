'use client';
import { useState } from 'react';

interface ReplenishmentHistory {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestDate: string;
  completionDate?: string;
  requestReason: string;
  supplier?: string;
  cost?: number;
}

interface ReplenishmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReplenishmentHistory['status']) => void;
  histories: ReplenishmentHistory[];
  productName?: string;
}

const mockHistories: ReplenishmentHistory[] = [
  {
    id: '1',
    productId: '1',
    productName: '阿莫西林胶囊',
    amount: 200,
    status: 'completed',
    requestDate: '2024-03-20 10:30:00',
    completionDate: '2024-03-22 15:30:00',
    requestReason: '库存低于安全库存',
    supplier: '供应商A',
    cost: 5000,
  },
  {
    id: '2',
    productId: '1',
    productName: '阿莫西林胶囊',
    amount: 150,
    status: 'pending',
    requestDate: '2024-03-23 09:15:00',
    requestReason: '销售趋势上升',
  },
];

export default function ReplenishmentHistoryModal({
  isOpen,
  onClose,
  onUpdateStatus,
  histories = mockHistories,
  productName,
}: ReplenishmentHistoryModalProps) {
  const [filter, setFilter] = useState<'all' | ReplenishmentHistory['status']>('all');

  if (!isOpen) return null;

  const filteredHistories = histories.filter(
    history => filter === 'all' || history.status === filter
  );

  const getStatusColor = (status: ReplenishmentHistory['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: ReplenishmentHistory['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            补货历史记录 {productName ? `- ${productName}` : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status === 'all' ? '全部' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">{history.productName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {history.requestReason}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(history.status)}`}>
                    {getStatusText(history.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      补货数量
                    </label>
                    <p className="mt-1 text-lg font-semibold">
                      {history.amount}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      申请时间
                    </label>
                    <p className="mt-1">
                      {history.requestDate}
                    </p>
                  </div>
                  {history.completionDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        完成时间
                      </label>
                      <p className="mt-1">
                        {history.completionDate}
                      </p>
                    </div>
                  )}
                  {history.supplier && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        供应商
                      </label>
                      <p className="mt-1">
                        {history.supplier}
                      </p>
                    </div>
                  )}
                </div>

                {history.cost && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        补货成本
                      </span>
                      <span className="text-lg font-semibold">
                        ¥{history.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {history.status === 'pending' && (
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      onClick={() => onUpdateStatus(history.id, 'processing')}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      开始处理
                    </button>
                    <button
                      onClick={() => onUpdateStatus(history.id, 'cancelled')}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      取消
                    </button>
                  </div>
                )}

                {history.status === 'processing' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onUpdateStatus(history.id, 'completed')}
                      className="px-3 py-1 text-sm text-green-600 hover:text-green-700"
                    >
                      标记完成
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
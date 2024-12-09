'use client';
import { useState } from 'react';

interface AlertHistory {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'high_stock';
  stock: number;
  threshold: number;
  timestamp: string;
  status: 'pending' | 'processed' | 'ignored';
}

interface AlertHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  histories: AlertHistory[];
  onUpdateStatus: (id: string, status: AlertHistory['status']) => void;
}

const mockHistories: AlertHistory[] = [
  {
    id: '1',
    productId: '1',
    productName: '阿莫西林胶囊',
    type: 'low_stock',
    stock: 50,
    threshold: 100,
    timestamp: '2024-03-20 10:30:00',
    status: 'pending',
  },
  {
    id: '2',
    productId: '1',
    productName: '阿莫西林胶囊',
    type: 'high_stock',
    stock: 1500,
    threshold: 1000,
    timestamp: '2024-03-19 15:45:00',
    status: 'processed',
  },
];

export default function AlertHistoryModal({
  isOpen,
  onClose,
  productName,
  histories = mockHistories,
  onUpdateStatus,
}: AlertHistoryModalProps) {
  const [filter, setFilter] = useState<'all' | AlertHistory['status']>('all');

  if (!isOpen) return null;

  const filteredHistories = histories.filter(
    history => filter === 'all' || history.status === filter
  );

  const getStatusColor = (status: AlertHistory['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'ignored':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: AlertHistory['type']) => {
    return type === 'low_stock' ? 'text-red-600' : 'text-yellow-600';
  };

  const getTypeText = (type: AlertHistory['type']) => {
    return type === 'low_stock' ? '库存不足' : '库存积压';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            预警历史记录 {productName ? `- ${productName}` : ''}
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
              {(['all', 'pending', 'processed', 'ignored'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status === 'all' ? '全部' :
                   status === 'pending' ? '待处理' :
                   status === 'processed' ? '已处理' : '已忽略'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    产品名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    预警类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    当前库存/阈值
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    触发时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistories.map((history) => (
                  <tr key={history.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {history.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${getTypeColor(history.type)}`}>
                        {getTypeText(history.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {history.stock} / {history.threshold}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {history.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(history.status)}`}>
                        {history.status === 'pending' ? '待处理' :
                         history.status === 'processed' ? '已处理' : '已忽略'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {history.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(history.id, 'processed')}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            标记处理
                          </button>
                          <button
                            onClick={() => onUpdateStatus(history.id, 'ignored')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            忽略
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface OrderHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  remarks?: string;
}

interface SupplierOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  histories: OrderHistory[];
}

const mockHistories: OrderHistory[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: '医药供应商A',
    orderNumber: 'PO20240320001',
    orderDate: '2024-03-20',
    deliveryDate: '2024-03-25',
    status: 'delivered',
    totalAmount: 50000,
    items: [
      {
        productName: '阿莫西林胶囊',
        quantity: 1000,
        price: 35,
        subtotal: 35000,
      },
      {
        productName: '布洛芬片',
        quantity: 600,
        price: 25,
        subtotal: 15000,
      },
    ],
    paymentStatus: 'paid',
    remarks: '常规采购订单',
  },
  {
    id: '2',
    supplierId: '1',
    supplierName: '医药供应商A',
    orderNumber: 'PO20240315001',
    orderDate: '2024-03-15',
    deliveryDate: '2024-03-20',
    status: 'delivered',
    totalAmount: 30000,
    items: [
      {
        productName: '阿莫西林胶囊',
        quantity: 800,
        price: 35,
        subtotal: 28000,
      },
      {
        productName: '布洛芬片',
        quantity: 80,
        price: 25,
        subtotal: 2000,
      },
    ],
    paymentStatus: 'paid',
  },
];

export default function SupplierOrderHistoryModal({
  isOpen,
  onClose,
  supplierName,
  histories = mockHistories,
}: SupplierOrderHistoryModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '3months' | '6months' | '1year'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | OrderHistory['status']>('all');

  if (!isOpen) return null;

  const getFilteredHistories = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    return histories.filter(history => {
      const orderDate = new Date(history.orderDate);
      const matchesPeriod = selectedPeriod === 'all' ||
        (selectedPeriod === '3months' && orderDate >= threeMonthsAgo) ||
        (selectedPeriod === '6months' && orderDate >= sixMonthsAgo) ||
        (selectedPeriod === '1year' && orderDate >= oneYearAgo);
      
      const matchesStatus = selectedStatus === 'all' || history.status === selectedStatus;
      
      return matchesPeriod && matchesStatus;
    });
  };

  const getStatusColor = (status: OrderHistory['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: OrderHistory['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'unpaid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExportExcel = () => {
    const exportData = histories.map(history => ({
      '订单编号': history.orderNumber,
      '下单日期': history.orderDate,
      '交付日期': history.deliveryDate,
      '订单状态': history.status === 'pending' ? '待处理' :
                 history.status === 'processing' ? '处理中' :
                 history.status === 'delivered' ? '已交付' : '已取消',
      '订单金额': history.totalAmount,
      '支付状态': history.paymentStatus === 'paid' ? '已支付' :
                 history.paymentStatus === 'partial' ? '部分支付' : '未支付',
      '备注': history.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "订单历史");
    XLSX.writeFile(wb, `${supplierName}_订单历史_${new Date().toLocaleDateString()}.xlsx`);
  };

  const filteredHistories = getFilteredHistories();
  const totalAmount = filteredHistories.reduce((sum, history) => sum + history.totalAmount, 0);
  const totalOrders = filteredHistories.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            订单历史 - {supplierName}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              导出Excel
            </button>
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
        </div>

        <div className="p-6 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                订单总数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {totalOrders}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均订单金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{totalOrders > 0 ? (totalAmount / totalOrders).toLocaleString() : 0}
              </p>
            </div>
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部时间' },
                { value: '3months', label: '近3个月' },
                { value: '6months', label: '近6个月' },
                { value: '1year', label: '近1年' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'processing', label: '处理中' },
                { value: 'delivered', label: '已交付' },
                { value: 'cancelled', label: '已取消' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedStatus === status.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* 订单列表 */}
          <div className="space-y-4">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      订单号：{history.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      下单日期：{history.orderDate}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(history.status)}`}>
                      {history.status === 'pending' ? '待处理' :
                       history.status === 'processing' ? '处理中' :
                       history.status === 'delivered' ? '已交付' : '已取消'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(history.paymentStatus)}`}>
                      {history.paymentStatus === 'paid' ? '已支付' :
                       history.paymentStatus === 'partial' ? '部分支付' : '未支付'}
                    </span>
                  </div>
                </div>

                <div className="border-t dark:border-gray-600 pt-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          产品名称
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          数量
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          单价
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          小计
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {history.items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2">{item.productName}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">¥{item.price.toFixed(2)}</td>
                          <td className="text-right">¥{item.subtotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right font-medium pt-4">
                          总计：
                        </td>
                        <td className="text-right font-bold pt-4">
                          ¥{history.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {history.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{history.remarks}
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
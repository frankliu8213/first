'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod?: string;
  shippingMethod?: string;
  remarks?: string;
  attachments?: string[];
}

interface SupplierOrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  orders: Order[];
  onCreateOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateOrder: (id: string, order: Partial<Order>) => void;
  onCancelOrder: (id: string) => void;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PO20240320001',
    orderDate: '2024-03-20',
    expectedDeliveryDate: '2024-03-25',
    status: 'processing',
    items: [
      {
        productId: '1',
        productName: '阿莫西林胶囊',
        quantity: 1000,
        price: 35,
        subtotal: 35000,
      },
      {
        productId: '2',
        productName: '布洛芬片',
        quantity: 600,
        price: 25,
        subtotal: 15000,
      },
    ],
    totalAmount: 50000,
    paymentStatus: 'partial',
    paymentMethod: '银行转账',
    shippingMethod: '陆运',
    remarks: '常规采购订单',
  },
  // 可以添加更多订单数据...
];

export default function SupplierOrderManagementModal({
  isOpen,
  onClose,
  supplierName,
  orders = mockOrders,
  onCreateOrder,
  onUpdateOrder,
  onCancelOrder,
}: SupplierOrderManagementModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'shipped': return '已发货';
      case 'delivered': return '已交付';
      case 'cancelled': return '已取消';
      default: return '未知状态';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'unpaid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return '已支付';
      case 'partial': return '部分支付';
      case 'unpaid': return '未支付';
      default: return '未知状态';
    }
  };

  // 订单趋势图配置
  const trendOption = {
    title: {
      text: '订单趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['订��数量', '订单金额'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
      },
      {
        type: 'value',
        name: '订单金额',
        axisLabel: {
          formatter: '{value} 元',
        },
      },
    ],
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: [10, 15, 12, 18, 14, 16],
      },
      {
        name: '订单金额',
        type: 'line',
        yAxisIndex: 1,
        data: [50000, 75000, 60000, 90000, 70000, 80000],
      },
    ],
  };

  // 订单状态分布图配置
  const statusOption = {
    title: {
      text: '订单状态分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 10, name: '待处理' },
          { value: 15, name: '处理中' },
          { value: 8, name: '已发货' },
          { value: 20, name: '已交付' },
          { value: 2, name: '已取消' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = orders.map(order => ({
      '订单编号': order.orderNumber,
      '下单日期': order.orderDate,
      '预计交付日期': order.expectedDeliveryDate,
      '实际交付日期': order.actualDeliveryDate || '',
      '订单状态': getStatusLabel(order.status),
      '订单金额': order.totalAmount,
      '支付状态': getPaymentStatusLabel(order.paymentStatus),
      '支付方式': order.paymentMethod || '',
      '运输方式': order.shippingMethod || '',
      '备注': order.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "订单列表");
    XLSX.writeFile(wb, `${supplierName}_订单列表_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            订单管理 - {supplierName}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新建订单
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总订单数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {orders.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                待处理订单
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                进行中订单
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {orders.filter(order => order.status === 'processing').length}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={statusOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 订单列表 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {['all', 'draft', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status === 'all' ? '全部' : getStatusLabel(status as Order['status'])}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {orders
                .filter(order => selectedStatus === 'all' || order.status === selectedStatus)
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-semibold">
                          订单号：{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          下单日期：{order.orderDate}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
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
                          {order.items.map((item, index) => (
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
                              ��计：
                            </td>
                            <td className="text-right font-bold pt-4">
                              ¥{order.totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {order.remarks && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        备注：{order.remarks}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        查看详情
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => onCancelOrder(order.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          取消订单
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
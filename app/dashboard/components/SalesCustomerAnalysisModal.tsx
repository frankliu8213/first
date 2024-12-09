'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface CustomerData {
  id: string;
  name: string;
  type: string;
  totalPurchase: number;
  orderCount: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
  purchaseFrequency: number;
  lifetimeValue: number;
  productPreferences: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  purchaseHistory: {
    date: string;
    amount: number;
    products: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  retentionScore: number;
}

interface SalesCustomerAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerData[];
}

export default function SalesCustomerAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesCustomerAnalysisModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData>(data[0]);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  // 客户购买趋势图配置
  const trendOption = {
    title: {
      text: '购买趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any[]) {
        const date = params[0].axisValue;
        let result = `${date}<br/>`;
        params.forEach((param) => {
          const value = typeof param.value === 'number' 
            ? param.value.toLocaleString() 
            : param.value;
          result += `${param.marker}${param.seriesName}: ${
            param.seriesName.includes('数量') ? value : '¥' + value
          }<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['购买金额', '产品数量'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: selectedCustomer.purchaseHistory.map(h => h.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '金额（元）',
        position: 'left',
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
      },
    ],
    series: [
      {
        name: '购买金额',
        type: 'line',
        data: selectedCustomer.purchaseHistory.map(h => h.amount),
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '产品数量',
        type: 'bar',
        yAxisIndex: 1,
        data: selectedCustomer.purchaseHistory.map(h => h.products),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  // 产品偏好分布图配置
  const preferenceOption = {
    title: {
      text: '产品偏好分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
        },
        data: selectedCustomer.productPreferences.map(pref => ({
          name: pref.category,
          value: pref.amount,
        })),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = data.map(customer => ({
      '客户名称': customer.name,
      '客户类型': customer.type,
      '总购买金额': customer.totalPurchase.toLocaleString(),
      '订单数量': customer.orderCount,
      '平均订单金额': customer.averageOrderValue.toLocaleString(),
      '最近购买日期': customer.lastPurchaseDate,
      '购买频率(天)': customer.purchaseFrequency,
      '客户终身价值': customer.lifetimeValue.toLocaleString(),
      '风险等级': customer.riskLevel === 'low' ? '低' :
                 customer.riskLevel === 'medium' ? '中' : '高',
      '保留评分': customer.retentionScore,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "客户分析");
    XLSX.writeFile(wb, `客户分析报告_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            客户销售分析
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
          {/* 客户选择 */}
          <div className="flex gap-2">
            {data.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCustomer.id === customer.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {customer.name}
              </button>
            ))}
          </div>

          {/* 客户概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总购买金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedCustomer.totalPurchase.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                订单数量
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedCustomer.orderCount}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均订单金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedCustomer.averageOrderValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                客户终身价值
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedCustomer.lifetimeValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={preferenceOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">客户画像</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">客户类型</span>
                  <span className="font-medium">{selectedCustomer.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">购买频率</span>
                  <span className="font-medium">{selectedCustomer.purchaseFrequency} 天</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">最近购买</span>
                  <span className="font-medium">{selectedCustomer.lastPurchaseDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">风险等级</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedCustomer.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                    selectedCustomer.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedCustomer.riskLevel === 'low' ? '低' :
                     selectedCustomer.riskLevel === 'medium' ? '中' : '高'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">保留评分</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600"
                      style={{ width: `${selectedCustomer.retentionScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
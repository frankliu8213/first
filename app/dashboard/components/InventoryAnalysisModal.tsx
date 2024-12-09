'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface InventoryAnalysis {
  turnoverRate: number;
  stockoutRate: number;
  overstockRate: number;
  averageInventoryDays: number;
  inventoryValue: number;
  trends: {
    date: string;
    stockLevel: number;
    inbound: number;
    outbound: number;
  }[];
  categories: {
    name: string;
    value: number;
    percentage: number;
  }[];
  alerts: {
    type: 'stockout' | 'overstock' | 'expiring';
    count: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  }[];
}

interface InventoryAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InventoryAnalysis;
}

const mockData: InventoryAnalysis = {
  turnoverRate: 4.5,
  stockoutRate: 2.3,
  overstockRate: 5.6,
  averageInventoryDays: 45,
  inventoryValue: 1250000,
  trends: [
    { date: '2024-01', stockLevel: 1200, inbound: 500, outbound: 450 },
    { date: '2024-02', stockLevel: 1250, inbound: 600, outbound: 550 },
    { date: '2024-03', stockLevel: 1300, inbound: 550, outbound: 500 },
  ],
  categories: [
    { name: '抗生素', value: 450000, percentage: 36 },
    { name: '解热镇痛', value: 300000, percentage: 24 },
    { name: '维生素', value: 250000, percentage: 20 },
    { name: '心血管', value: 150000, percentage: 12 },
    { name: '消化系统', value: 100000, percentage: 8 },
  ],
  alerts: [
    { type: 'stockout', count: 12, trend: 'down', percentage: 15 },
    { type: 'overstock', count: 8, trend: 'up', percentage: 10 },
    { type: 'expiring', count: 5, trend: 'stable', percentage: 6 },
  ],
};

export default function InventoryAnalysisModal({
  isOpen,
  onClose,
  data = mockData,
}: InventoryAnalysisModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1month' | '3months' | '6months' | '1year'>('3months');

  if (!isOpen) return null;

  // 库存趋势图配置
  const trendOption = {
    title: {
      text: '库存趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['库存水平', '入库量', '出库量'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '库存水平',
        type: 'line',
        data: data.trends.map(t => t.stockLevel),
        smooth: true,
      },
      {
        name: '入库量',
        type: 'bar',
        data: data.trends.map(t => t.inbound),
      },
      {
        name: '出库量',
        type: 'bar',
        data: data.trends.map(t => t.outbound),
      },
    ],
  };

  // 类别分布图配置
  const categoryOption = {
    title: {
      text: '库存类别分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
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
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.categories.map(c => ({
          name: c.name,
          value: c.value,
        })),
      },
    ],
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            库存分析报告
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

        <div className="p-6 space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                周转率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.turnoverRate.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                缺货率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.stockoutRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                积压率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.overstockRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均库存天数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.averageInventoryDays}天
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                库存总值
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{(data.inventoryValue / 10000).toFixed(1)}万
              </p>
            </div>
          </div>

          {/* 预警信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.alerts.map((alert, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {alert.type === 'stockout' ? '缺货预警' :
                   alert.type === 'overstock' ? '积压预警' : '效期预警'}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-semibold">
                    {alert.count}
                  </p>
                  <div className="flex items-center">
                    <span className={`${getTrendColor(alert.trend)} text-lg mr-1`}>
                      {getTrendIcon(alert.trend)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={categoryOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 类别明细 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">类别明细</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      类别
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      库存金额
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {data.categories.map((category, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-300">
                        ¥{category.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-300">
                        {category.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
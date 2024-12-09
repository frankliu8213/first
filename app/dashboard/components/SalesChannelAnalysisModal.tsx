'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface ChannelData {
  id: string;
  name: string;
  sales: number;
  growth: number;
  marketShare: number;
  products: {
    name: string;
    sales: number;
    percentage: number;
  }[];
  customers: {
    type: string;
    count: number;
    sales: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    sales: number;
    target: number;
  }[];
  performance: {
    metric: string;
    value: number;
    target: number;
    status: 'good' | 'warning' | 'bad';
  }[];
}

interface SalesChannelAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChannelData[];
}

export default function SalesChannelAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesChannelAnalysisModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelData>(data[0]);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  // 渠道销售分布图配置
  const distributionOption = {
    title: {
      text: '渠道销售分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}万元 ({d}%)',
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
        data: data.map(channel => ({
          name: channel.name,
          value: (channel.sales / 10000).toFixed(2),
        })),
      },
    ],
  };

  // 销售趋势图配置
  const trendOption = {
    title: {
      text: '销售趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['实际销售', '目标销售'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: selectedChannel.trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
      name: '销售额（万元）',
    },
    series: [
      {
        name: '实际销售',
        type: 'line',
        data: selectedChannel.trends.map(t => (t.sales / 10000).toFixed(2)),
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '目标销售',
        type: 'line',
        data: selectedChannel.trends.map(t => (t.target / 10000).toFixed(2)),
        smooth: true,
        itemStyle: { color: '#52c41a' },
        lineStyle: { type: 'dashed' },
      },
    ],
  };

  // 客户类型分布图配置
  const customerOption = {
    title: {
      text: '客户类型分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}万元 ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: selectedChannel.customers.map(customer => ({
          name: customer.type,
          value: (customer.sales / 10000).toFixed(2),
        })),
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
    const exportData = data.map(channel => ({
      '渠道名称': channel.name,
      '销售额': channel.sales.toLocaleString(),
      '增长率': `${channel.growth}%`,
      '市场份额': `${channel.marketShare}%`,
      '主要产品': channel.products.map(p => `${p.name}(${p.percentage}%)`).join('、'),
      '客户构成': channel.customers.map(c => `${c.type}(${c.percentage}%)`).join('、'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "渠道分析");
    XLSX.writeFile(wb, `渠道销售分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            渠道销售分析
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
          {/* 渠道选择 */}
          <div className="flex gap-2">
            {data.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedChannel.id === channel.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {channel.name}
              </button>
            ))}
          </div>

          {/* 渠道概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                销售额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedChannel.sales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                增长率
              </h4>
              <p className={`text-2xl font-semibold mt-2 ${
                selectedChannel.growth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedChannel.growth > 0 ? '+' : ''}{selectedChannel.growth}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                市场份额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedChannel.marketShare}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                客户数量
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedChannel.customers.reduce((sum, c) => sum + c.count, 0)}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={distributionOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={customerOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 绩效指标 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">渠道绩效指标</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedChannel.performance.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.metric}
                    </span>
                    <span className={`text-sm font-medium ${
                      metric.status === 'good' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metric.status === 'good' ? 'bg-green-600' :
                        metric.status === 'warning' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${(metric.value / metric.target) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    目标: {metric.target}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 产品分析表格 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">产品销售分析</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      产品名称
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      销售额
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedChannel.products.map((product) => (
                    <tr key={product.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        ¥{product.sales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        {product.percentage}%
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
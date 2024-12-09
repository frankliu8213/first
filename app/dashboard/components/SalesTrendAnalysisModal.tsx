'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface SalesData {
  date: string;
  revenue: number;
  volume: number;
  profit: number;
  averagePrice: number;
  categories: {
    name: string;
    revenue: number;
    volume: number;
  }[];
  channels: {
    name: string;
    revenue: number;
    percentage: number;
  }[];
  topProducts: {
    name: string;
    revenue: number;
    volume: number;
    growth: number;
  }[];
}

interface SalesTrendAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SalesData[];
}

export default function SalesTrendAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesTrendAnalysisModalProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [metric, setMetric] = useState<'revenue' | 'volume' | 'profit'>('revenue');

  if (!isOpen) return null;

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
      data: ['销售额', '销量', '利润'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
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
        name: '销售额',
        type: 'line',
        smooth: true,
        data: data.map(d => d.revenue),
      },
      {
        name: '销量',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(d => d.volume),
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: data.map(d => d.profit),
      },
    ],
  };

  // 品类分布图配置
  const categoryOption = {
    title: {
      text: '品类销售分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data[data.length - 1].categories.map(c => ({
          name: c.name,
          value: c.revenue,
        })),
      },
    ],
  };

  // 渠道分布图配置
  const channelOption = {
    title: {
      text: '销售渠道分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data[data.length - 1].channels.map(c => ({
          name: c.name,
          value: c.revenue,
        })),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = data.map(d => ({
      '日期': d.date,
      '销售额': d.revenue,
      '销量': d.volume,
      '利润': d.profit,
      '平均单价': d.averagePrice,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "销售趋势");
    XLSX.writeFile(wb, `销售趋势分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            销售趋势分析
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
          {/* 时间范围和指标选择 */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {[
                { value: 'week', label: '本周' },
                { value: 'month', label: '本月' },
                { value: 'quarter', label: '本季度' },
                { value: 'year', label: '本年' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'revenue', label: '销售额' },
                { value: 'volume', label: '销量' },
                { value: 'profit', label: '利润' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMetric(m.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    metric === m.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={categoryOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={channelOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 热销产品列表 */}
          <div>
            <h4 className="text-lg font-medium mb-4">热销产品</h4>
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
                      销量
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      环比增长
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data[data.length - 1].topProducts.map((product) => (
                    <tr key={product.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        ¥{product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        {product.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`${
                          product.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.growth > 0 ? '+' : ''}{product.growth}%
                        </span>
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
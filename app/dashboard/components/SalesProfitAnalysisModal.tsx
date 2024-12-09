'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface ProfitData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  profitRate: number;
  categories: {
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    profitRate: number;
  }[];
  products: {
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    profitRate: number;
    trend: number;
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

interface SalesProfitAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProfitData[];
}

export default function SalesProfitAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesProfitAnalysisModalProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'profit' | 'profitRate'>('profit');

  if (!isOpen) return null;

  // 利润趋势图配置
  const trendOption = {
    title: {
      text: '利润趋势分析',
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
            param.seriesName.includes('率') ? value + '%' : '¥' + value
          }<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['收入', '成本', '利润', '利润率'],
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
        name: '利润率（%）',
        position: 'right',
        max: 100,
        min: 0,
      },
    ],
    series: [
      {
        name: '收入',
        type: 'bar',
        data: data.map(d => d.revenue),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '成本',
        type: 'bar',
        data: data.map(d => d.cost),
        itemStyle: { color: '#ff4d4f' },
      },
      {
        name: '利润',
        type: 'bar',
        data: data.map(d => d.profit),
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '利润率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => (d.profitRate * 100).toFixed(1)),
        itemStyle: { color: '#722ed1' },
      },
    ],
  };

  // 品类利润分布图配置
  const categoryOption = {
    title: {
      text: '品类利润分布',
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
        data: data[data.length - 1].categories.map(c => ({
          name: c.name,
          value: selectedMetric === 'profit' ? c.profit : (c.profitRate * 100).toFixed(1),
        })),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = data.map(d => ({
      '日期': d.date,
      '收入': d.revenue,
      '成本': d.cost,
      '利润': d.profit,
      '利润率': (d.profitRate * 100).toFixed(1) + '%',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "利润分析");
    XLSX.writeFile(wb, `利润分析报告_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            利润分析
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
          {/* 利润概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总收入
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{data[data.length - 1].revenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总成本
              </h4>
              <p className="text-2xl font-semibold mt-2 text-red-600">
                ¥{data[data.length - 1].cost.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                利润
              </h4>
              <p className="text-2xl font-semibold mt-2 text-green-600">
                ¥{data[data.length - 1].profit.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                利润率
              </h4>
              <p className="text-2xl font-semibold mt-2 text-purple-600">
                {(data[data.length - 1].profitRate * 100).toFixed(1)}%
              </p>
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
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">影响因素分析</h4>
              <div className="space-y-4">
                {data[data.length - 1].factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{factor.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {factor.description}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      factor.impact > 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 产品利润排名 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">产品利润排名</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      产品名称
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      收入
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      成本
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      利润
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      利润率
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      趋势
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data[data.length - 1].products
                    .sort((a, b) => b.profit - a.profit)
                    .map((product) => (
                    <tr key={product.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        ¥{product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        ¥{product.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        ¥{product.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                        {(product.profitRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`${
                          product.trend > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.trend > 0 ? '↑' : '↓'}{Math.abs(product.trend)}%
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
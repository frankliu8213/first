'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface RegionSalesData {
  region: string;
  sales: number;
  growth: number;
  marketShare: number;
  products: {
    name: string;
    sales: number;
    percentage: number;
  }[];
  channels: {
    name: string;
    sales: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    sales: number;
    target: number;
  }[];
}

interface SalesRegionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RegionSalesData[];
}

export default function SalesRegionAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesRegionAnalysisModalProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionSalesData>(data[0]);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  // 区域销售分布图配置
  const distributionOption = {
    title: {
      text: '区域销售分布',
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
          show: true,
          formatter: '{b}: {c}万元\n{d}%',
        },
        data: data.map(region => ({
          name: region.region,
          value: (region.sales / 10000).toFixed(2),
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
      data: selectedRegion.trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
      name: '销售额（万元）',
    },
    series: [
      {
        name: '实际销售',
        type: 'line',
        data: selectedRegion.trends.map(t => (t.sales / 10000).toFixed(2)),
        smooth: true,
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '目标销售',
        type: 'line',
        data: selectedRegion.trends.map(t => (t.target / 10000).toFixed(2)),
        smooth: true,
        itemStyle: { color: '#52c41a' },
        lineStyle: { type: 'dashed' },
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
      formatter: '{b}: {c}万元 ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: selectedRegion.channels.map(channel => ({
          name: channel.name,
          value: (channel.sales / 10000).toFixed(2),
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
    const exportData = data.map(region => ({
      '区域': region.region,
      '销售额': region.sales.toLocaleString(),
      '增长率': `${region.growth}%`,
      '市场份额': `${region.marketShare}%`,
      '主要产品': region.products.map(p => `${p.name}(${p.percentage}%)`).join('、'),
      '主要渠道': region.channels.map(c => `${c.name}(${c.percentage}%)`).join('、'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "区域销售分析");
    XLSX.writeFile(wb, `区域销售分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            区域销售分析
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
          {/* 区域选择 */}
          <div className="flex gap-2">
            {data.map((region) => (
              <button
                key={region.region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedRegion.region === region.region
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {region.region}
              </button>
            ))}
          </div>

          {/* 区域概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                销售额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedRegion.sales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                增长率
              </h4>
              <p className={`text-2xl font-semibold mt-2 ${
                selectedRegion.growth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedRegion.growth > 0 ? '+' : ''}{selectedRegion.growth}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                市场份额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedRegion.marketShare}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                主要产品数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedRegion.products.length}
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
              <ReactECharts option={channelOption} style={{ height: '400px' }} />
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
                  {selectedRegion.products.map((product) => (
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
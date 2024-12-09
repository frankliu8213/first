'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface RankingData {
  productId: string;
  productName: string;
  category: string;
  sales: number;
  revenue: number;
  growth: number;
  marketShare: number;
  profitMargin: number;
  trends: {
    date: string;
    sales: number;
    revenue: number;
  }[];
  customers: {
    type: string;
    sales: number;
    percentage: number;
  }[];
  regions: {
    name: string;
    sales: number;
    percentage: number;
  }[];
}

interface SalesRankingAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RankingData[];
}

export default function SalesRankingAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesRankingAnalysisModalProps) {
  const [sortBy, setSortBy] = useState<'sales' | 'revenue' | 'growth' | 'profitMargin'>('sales');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  // 排名柱状图配置
  const rankingOption = {
    title: {
      text: '产品销售排名',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: sortBy === 'sales' ? '销量' :
            sortBy === 'revenue' ? '收入(万元)' :
            sortBy === 'growth' ? '增长率(%)' : '利润率(%)',
    },
    yAxis: {
      type: 'category',
      data: data
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, 10)
        .map(item => item.productName),
    },
    series: [
      {
        name: sortBy === 'sales' ? '销量' :
              sortBy === 'revenue' ? '收入' :
              sortBy === 'growth' ? '增长率' : '利润率',
        type: 'bar',
        data: data
          .sort((a, b) => b[sortBy] - a[sortBy])
          .slice(0, 10)
          .map(item => ({
            value: sortBy === 'revenue' ? (item[sortBy] / 10000).toFixed(2) : item[sortBy],
            itemStyle: {
              color: sortBy === 'growth' || sortBy === 'profitMargin'
                ? item[sortBy] >= 0 ? '#52c41a' : '#f5222d'
                : '#1890ff'
            },
          })),
      },
    ],
  };

  // 趋势分析图配置
  const trendOption = {
    title: {
      text: '销售趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['销量', '收入'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data[0].trends.map(t => t.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '销量',
        position: 'left',
      },
      {
        type: 'value',
        name: '收入(万元)',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销量',
        type: 'line',
        data: data[0].trends.map(t => t.sales),
      },
      {
        name: '收入',
        type: 'line',
        yAxisIndex: 1,
        data: data[0].trends.map(t => (t.revenue / 10000).toFixed(2)),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = data.map(item => ({
      '产品名称': item.productName,
      '类别': item.category,
      '销量': item.sales,
      '收入': item.revenue.toLocaleString(),
      '增长率': `${item.growth}%`,
      '市场份额': `${item.marketShare}%`,
      '利润率': `${item.profitMargin}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "销售排名");
    XLSX.writeFile(wb, `销售排名分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            销售排名分析
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
          {/* 筛选和排序选项 */}
          <div className="flex flex-wrap gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              <option value="sales">按销量</option>
              <option value="revenue">按收入</option>
              <option value="growth">按增长率</option>
              <option value="profitMargin">按利润率</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年度</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              <option value="all">全部类别</option>
              {Array.from(new Set(data.map(item => item.category))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={rankingOption} style={{ height: '400px' }} />
            </div>
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 排名列表 */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    排名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    产品名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    类别
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    销量
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    收入
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    增长率
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    利润率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {data
                  .sort((a, b) => b[sortBy] - a[sortBy])
                  .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                  .map((item, index) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        {item.sales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        ¥{item.revenue.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        item.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.growth >= 0 ? '+' : ''}{item.growth}%
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.profitMargin}%
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
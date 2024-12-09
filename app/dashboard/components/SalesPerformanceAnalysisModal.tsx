'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface PerformanceData {
  period: string;
  metrics: {
    revenue: number;
    profit: number;
    orderCount: number;
    averageOrderValue: number;
    customerCount: number;
    newCustomerCount: number;
    repeatPurchaseRate: number;
    productCategories: {
      name: string;
      revenue: number;
      percentage: number;
    }[];
    salesChannels: {
      name: string;
      revenue: number;
      percentage: number;
    }[];
    salesTeam: {
      name: string;
      revenue: number;
      target: number;
      achievement: number;
    }[];
  };
  kpis: {
    name: string;
    actual: number;
    target: number;
    status: 'exceeded' | 'met' | 'below';
  }[];
  trends: {
    date: string;
    revenue: number;
    profit: number;
    orders: number;
  }[];
}

interface SalesPerformanceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PerformanceData;
}

export default function SalesPerformanceAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesPerformanceAnalysisModalProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

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
      data: ['销售额', '利润', '订单数'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.trends.map(t => t.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: data.trends.map(t => t.revenue),
        smooth: true,
      },
      {
        name: '利润',
        type: 'line',
        data: data.trends.map(t => t.profit),
        smooth: true,
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: data.trends.map(t => t.orders),
      },
    ],
  };

  // 产品类别分布图配置
  const categoryOption = {
    title: {
      text: '产品类别分布',
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
        data: data.metrics.productCategories.map(c => ({
          name: c.name,
          value: c.revenue,
        })),
      },
    ],
  };

  // 销售团队业绩图配置
  const teamOption = {
    title: {
      text: '销售团队业绩',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['实际销售额', '目标销售额'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.metrics.salesTeam.map(t => t.name),
    },
    yAxis: {
      type: 'value',
      name: '销售额',
    },
    series: [
      {
        name: '实际销售额',
        type: 'bar',
        data: data.metrics.salesTeam.map(t => t.revenue),
      },
      {
        name: '目标销售额',
        type: 'bar',
        data: data.metrics.salesTeam.map(t => t.target),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = {
      '销售指标': {
        '销售额': data.metrics.revenue,
        '利润': data.metrics.profit,
        '订单数': data.metrics.orderCount,
        '平均订单金额': data.metrics.averageOrderValue,
        '客户数': data.metrics.customerCount,
        '新客户数': data.metrics.newCustomerCount,
        '复购率': `${data.metrics.repeatPurchaseRate}%`,
      },
      'KPI达成情况': data.kpis.map(kpi => ({
        '指标名称': kpi.name,
        '实际值': kpi.actual,
        '目标值': kpi.target,
        '状态': kpi.status === 'exceeded' ? '超额完成' :
               kpi.status === 'met' ? '达标' : '未达标',
      })),
    };

    const ws = XLSX.utils.json_to_sheet([exportData['销售指标']]);
    const ws2 = XLSX.utils.json_to_sheet(exportData['KPI达成情况']);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "销售指标");
    XLSX.utils.book_append_sheet(wb, ws2, "KPI达成情况");
    XLSX.writeFile(wb, `销售绩效分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            销售绩效分析
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
          {/* 关键指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                销售额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{data.metrics.revenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                订单数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.metrics.orderCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                新客户数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.metrics.newCustomerCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                复购率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.metrics.repeatPurchaseRate}%
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
            <div>
              <ReactECharts option={teamOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* KPI达成情况 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">KPI达成情况</h4>
            <div className="space-y-4">
              {data.kpis.map((kpi, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{kpi.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      目标：{kpi.target} / 实际：{kpi.actual}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    kpi.status === 'exceeded' ? 'bg-green-100 text-green-800' :
                    kpi.status === 'met' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kpi.status === 'exceeded' ? '超额完成' :
                     kpi.status === 'met' ? '达标' : '未达标'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
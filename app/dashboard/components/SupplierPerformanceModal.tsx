'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface PerformanceData {
  period: string;
  metrics: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
    defectRate: number;
    onTimeDeliveryRate: number;
    returnRate: number;
    responseTime: number;
    costSavings: number;
  };
  kpis: {
    target: string;
    actual: string;
    status: 'exceeded' | 'met' | 'below';
  }[];
}

interface SupplierPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  performanceData: PerformanceData[];
}

export default function SupplierPerformanceModal({
  isOpen,
  onClose,
  supplierName,
  performanceData,
}: SupplierPerformanceModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year' | 'all'>('all');

  if (!isOpen || !performanceData.length) return null;

  const latestData = performanceData[0];

  // 雷达图配置
  const radarOption = {
    title: {
      text: '绩效雷达图',
      left: 'center',
    },
    radar: {
      indicator: [
        { name: '产品质量', max: 5 },
        { name: '交付表现', max: 5 },
        { name: '价格竞争力', max: 5 },
        { name: '服务质量', max: 5 },
        { name: '合作态度', max: 5 },
      ],
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          latestData.metrics.qualityScore,
          latestData.metrics.deliveryScore,
          latestData.metrics.priceScore,
          latestData.metrics.serviceScore,
          latestData.metrics.cooperationScore,
        ],
        name: '绩效得分',
      }],
    }],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-green-600 bg-green-100';
      case 'met': return 'text-blue-600 bg-blue-100';
      case 'below': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'exceeded': return '超出目标';
      case 'met': return '达到目标';
      case 'below': return '未达标';
      default: return '未知状态';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            绩效分析 - {supplierName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            type="button"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 关键指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                产品合格率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {(100 - latestData.metrics.defectRate).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                准时交付率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {latestData.metrics.onTimeDeliveryRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                退货率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {latestData.metrics.returnRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                响应时间
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {latestData.metrics.responseTime}h
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                成本节省
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {latestData.metrics.costSavings}%
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <ReactECharts option={radarOption} style={{ height: '400px' }} />
          </div>

          {/* KPI达成情况 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">KPI达成情况</h4>
            <div className="space-y-4">
              {latestData.kpis.map((kpi, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      目标值：{kpi.target}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      实际值：{kpi.actual}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(kpi.status)}`}>
                    {getStatusLabel(kpi.status)}
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
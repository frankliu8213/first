'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface EvaluationData {
  date: string;
  overallScore: number;
  categories: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
  };
}

interface EvaluationAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  evaluationData: EvaluationData[];
}

const mockData: EvaluationData[] = [
  {
    date: '2024-01',
    overallScore: 4.2,
    categories: {
      qualityScore: 4.5,
      deliveryScore: 4.0,
      priceScore: 4.0,
      serviceScore: 4.5,
      cooperationScore: 4.0,
    },
  },
  {
    date: '2024-02',
    overallScore: 4.0,
    categories: {
      qualityScore: 4.0,
      deliveryScore: 3.5,
      priceScore: 4.0,
      serviceScore: 4.5,
      cooperationScore: 4.0,
    },
  },
  {
    date: '2024-03',
    overallScore: 4.3,
    categories: {
      qualityScore: 4.5,
      deliveryScore: 4.0,
      priceScore: 4.5,
      serviceScore: 4.0,
      cooperationScore: 4.5,
    },
  },
];

export default function EvaluationAnalysisModal({
  isOpen,
  onClose,
  supplierName,
  evaluationData = mockData,
}: EvaluationAnalysisModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year' | 'all'>('all');

  if (!isOpen) return null;

  // 趋势图配置
  const trendOption = {
    title: {
      text: '评分趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['总评分', '产品质量', '交付表现', '价格竞争力', '服务质量', '合作态度'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: evaluationData.map(d => d.date),
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 5,
    },
    series: [
      {
        name: '总评分',
        type: 'line',
        data: evaluationData.map(d => d.overallScore),
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
      },
      {
        name: '产品质量',
        type: 'line',
        data: evaluationData.map(d => d.categories.qualityScore),
      },
      {
        name: '交付表现',
        type: 'line',
        data: evaluationData.map(d => d.categories.deliveryScore),
      },
      {
        name: '价格竞争力',
        type: 'line',
        data: evaluationData.map(d => d.categories.priceScore),
      },
      {
        name: '服务质量',
        type: 'line',
        data: evaluationData.map(d => d.categories.serviceScore),
      },
      {
        name: '合作态度',
        type: 'line',
        data: evaluationData.map(d => d.categories.cooperationScore),
      },
    ],
  };

  // 雷达图配置
  const latestData = evaluationData[evaluationData.length - 1];
  const radarOption = {
    title: {
      text: '最新评分分析',
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
          latestData.categories.qualityScore,
          latestData.categories.deliveryScore,
          latestData.categories.priceScore,
          latestData.categories.serviceScore,
          latestData.categories.cooperationScore,
        ],
        name: '评分维度',
        areaStyle: {
          opacity: 0.3,
        },
      }],
    }],
  };

  // 计算统计数据
  const averageScore = evaluationData.reduce((sum, data) => sum + data.overallScore, 0) / evaluationData.length;
  const scoreChange = evaluationData[evaluationData.length - 1].overallScore - evaluationData[0].overallScore;
  const trend = scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'stable';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            评估数据分析 - {supplierName}
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
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均评分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {averageScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                评分趋势
              </h4>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-semibold">
                  {Math.abs(scoreChange).toFixed(1)}
                </span>
                <span className={`ml-2 ${
                  trend === 'up' ? 'text-green-600' :
                  trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                评估次数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {evaluationData.length}
              </p>
            </div>
          </div>

          {/* 时间筛选 */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部' },
              { value: '3months', label: '近3个月' },
              { value: '6months', label: '近6个月' },
              { value: '1year', label: '近1年' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={radarOption} style={{ height: '400px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface SupplierRanking {
  id: string;
  name: string;
  category: string[];
  overallScore: number;
  scores: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lastEvaluation: string;
  evaluationCount: number;
}

interface SupplierRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: SupplierRanking[];
}

export default function SupplierRankingModal({
  isOpen,
  onClose,
  rankings,
}: SupplierRankingModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof SupplierRanking['scores'] | 'overallScore'>('overallScore');

  if (!isOpen) return null;

  // 排名趋势图配置
  const trendOption = {
    title: {
      text: '供应商评分趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['平均分', '最高分', '最低分'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4'],
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 5,
    },
    series: [
      {
        name: '平均分',
        type: 'line',
        data: [4.2, 4.3, 4.4, 4.5],
        smooth: true,
      },
      {
        name: '最高分',
        type: 'line',
        data: [4.5, 4.6, 4.7, 4.8],
        smooth: true,
      },
      {
        name: '最低分',
        type: 'line',
        data: [3.8, 3.9, 4.0, 4.1],
        smooth: true,
      },
    ],
  };

  // 评分分布图配置
  const distributionOption = {
    title: {
      text: '评分分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
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
        data: [
          { value: 5, name: '4.5-5.0分' },
          { value: 8, name: '4.0-4.5分' },
          { value: 4, name: '3.5-4.0分' },
          { value: 2, name: '3.0-3.5分' },
          { value: 1, name: '3.0分以下' },
        ],
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = rankings.map(ranking => ({
      '供应商名称': ranking.name,
      '类别': ranking.category.join('、'),
      '总评分': ranking.overallScore.toFixed(1),
      '质量评分': ranking.scores.qualityScore.toFixed(1),
      '交付评分': ranking.scores.deliveryScore.toFixed(1),
      '价格评分': ranking.scores.priceScore.toFixed(1),
      '服务评分': ranking.scores.serviceScore.toFixed(1),
      '合作评分': ranking.scores.cooperationScore.toFixed(1),
      '评估次数': ranking.evaluationCount,
      '最近评估': ranking.lastEvaluation,
      '趋势': ranking.trend === 'up' ? '上升' :
             ranking.trend === 'down' ? '下降' : '稳定',
      '变化幅度': ranking.trendValue.toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "供应商排名");
    XLSX.writeFile(wb, `供应商评分排名_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            供应商绩效排名
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
          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={distributionOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 排名列表 */}
          <div className="space-y-4">
            {rankings.map((ranking, index) => (
              <div
                key={ranking.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                      <div>
                        <h4 className="text-lg font-medium">{ranking.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {ranking.category.join('、')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {ranking.overallScore.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                      {ranking.trend === 'up' && <span className="text-green-600">↑{ranking.trendValue}</span>}
                      {ranking.trend === 'down' && <span className="text-red-600">↓{ranking.trendValue}</span>}
                      {ranking.trend === 'stable' && <span className="text-gray-600">→</span>}
                      <span>评估 {ranking.evaluationCount} 次</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">质量评分</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ranking.scores.qualityScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">交付评分</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ranking.scores.deliveryScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">价格评分</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ranking.scores.priceScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">服务评分</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ranking.scores.serviceScore.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">合作评分</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {ranking.scores.cooperationScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
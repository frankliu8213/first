'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface PerformanceMetric {
  id: string;
  name: string;
  category: '质量' | '交付' | '成本' | '服务' | '创新';
  weight: number;
  score: number;
  target: number;
  actual: number;
  trend: 'up' | 'down' | 'stable';
  historicalData: {
    date: string;
    value: number;
  }[];
}

interface PerformanceEvaluation {
  supplierId: string;
  supplierName: string;
  evaluationPeriod: string;
  overallScore: number;
  metrics: PerformanceMetric[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextEvaluationDate: string;
  status: 'draft' | 'published' | 'archived';
}

interface SupplierPerformanceEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  evaluation: PerformanceEvaluation;
  onSave: (evaluation: PerformanceEvaluation) => void;
}

const metricCategories = ['质量', '交付', '成本', '服务', '创新'] as const;

export default function SupplierPerformanceEvaluationModal({
  isOpen,
  onClose,
  supplierName,
  evaluation,
  onSave,
}: SupplierPerformanceEvaluationModalProps) {
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);

  if (!isOpen) return null;

  const handleMetricScoreChange = (metricId: string, score: number) => {
    const updatedMetrics = currentEvaluation.metrics.map(metric =>
      metric.id === metricId ? { ...metric, score } : metric
    );

    // 计算新的总分
    const overallScore = updatedMetrics.reduce(
      (sum, metric) => sum + (metric.score * metric.weight),
      0
    ) / updatedMetrics.reduce((sum, metric) => sum + metric.weight, 0);

    setCurrentEvaluation({
      ...currentEvaluation,
      metrics: updatedMetrics,
      overallScore,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentEvaluation);
  };

  // 绩效雷达图配置
  const radarOption = {
    title: {
      text: '绩效评估雷达图',
      left: 'center',
    },
    radar: {
      indicator: metricCategories.map(category => ({
        name: category,
        max: 5,
      })),
    },
    series: [{
      type: 'radar',
      data: [{
        value: metricCategories.map(category => {
          const metrics = currentEvaluation.metrics.filter(m => m.category === category);
          return metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
        }),
        name: '评分',
      }],
    }],
  };

  // 历史趋势图配置
  const trendOption = selectedMetric ? {
    title: {
      text: `${selectedMetric.name}趋势`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: selectedMetric.historicalData.map(d => d.date),
    },
    yAxis: {
      type: 'value',
      name: '得分',
    },
    series: [{
      data: selectedMetric.historicalData.map(d => d.value),
      type: 'line',
      smooth: true,
    }],
  } : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            绩效评估 - {supplierName}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 评估概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总评分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {currentEvaluation.overallScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                评估周期
              </h4>
              <p className="text-lg mt-2">
                {currentEvaluation.evaluationPeriod}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                下次评估
              </h4>
              <p className="text-lg mt-2">
                {currentEvaluation.nextEvaluationDate}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                状态
              </h4>
              <p className="text-lg mt-2">
                {currentEvaluation.status === 'draft' ? '草稿' :
                 currentEvaluation.status === 'published' ? '已发布' : '已归档'}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={radarOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              {selectedMetric ? (
                <ReactECharts option={trendOption} style={{ height: '400px' }} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  选择指标查看趋势
                </div>
              )}
            </div>
          </div>

          {/* 评估指标 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">评估指标</h4>
            {metricCategories.map(category => (
              <div key={category} className="space-y-4">
                <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">
                  {category}指标
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentEvaluation.metrics
                    .filter(metric => metric.category === category)
                    .map(metric => (
                      <div
                        key={metric.id}
                        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow cursor-pointer"
                        onClick={() => setSelectedMetric(metric)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h6 className="font-medium">{metric.name}</h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              权重：{(metric.weight * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-semibold">
                              {metric.score.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              目标：{metric.target.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={metric.score}
                            onChange={(e) => handleMetricScoreChange(metric.id, parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* 评估总结 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-4">优势</h4>
              <textarea
                value={currentEvaluation.strengths.join('\n')}
                onChange={(e) => setCurrentEvaluation({
                  ...currentEvaluation,
                  strengths: e.target.value.split('\n').filter(s => s.trim()),
                })}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="输入供应商优势..."
              />
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">改进空间</h4>
              <textarea
                value={currentEvaluation.weaknesses.join('\n')}
                onChange={(e) => setCurrentEvaluation({
                  ...currentEvaluation,
                  weaknesses: e.target.value.split('\n').filter(s => s.trim()),
                })}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="输入需要改进的地方..."
              />
            </div>
          </div>

          {/* 改进建议 */}
          <div>
            <h4 className="text-lg font-medium mb-4">改进建议</h4>
            <textarea
              value={currentEvaluation.recommendations.join('\n')}
              onChange={(e) => setCurrentEvaluation({
                ...currentEvaluation,
                recommendations: e.target.value.split('\n').filter(s => s.trim()),
              })}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="输入改进建议..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
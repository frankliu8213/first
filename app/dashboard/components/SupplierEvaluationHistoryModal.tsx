'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface EvaluationHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  evaluationDate: string;
  evaluator: string;
  overallScore: number;
  categories: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
  };
  recommendations: string[];
  status: 'draft' | 'published' | 'archived';
}

interface SupplierEvaluationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  histories: EvaluationHistory[];
}

const mockHistories: EvaluationHistory[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: '医药供应商A',
    evaluationDate: '2024-03-20',
    evaluator: '张三',
    overallScore: 4.2,
    categories: {
      qualityScore: 4.5,
      deliveryScore: 4.0,
      priceScore: 4.0,
      serviceScore: 4.5,
      cooperationScore: 4.0,
    },
    recommendations: [
      '继续保持产品质量',
      '建议优化配送时间',
    ],
    status: 'published',
  },
  {
    id: '2',
    supplierId: '1',
    supplierName: '医药供应商A',
    evaluationDate: '2024-02-20',
    evaluator: '李四',
    overallScore: 3.8,
    categories: {
      qualityScore: 4.0,
      deliveryScore: 3.5,
      priceScore: 3.5,
      serviceScore: 4.0,
      cooperationScore: 4.0,
    },
    recommendations: [
      '需要改进交付及时性',
      '建议降低采购价格',
    ],
    status: 'published',
  },
];

export default function SupplierEvaluationHistoryModal({
  isOpen,
  onClose,
  supplierName,
  histories = mockHistories,
}: SupplierEvaluationHistoryModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '3months' | '6months' | '1year'>('all');

  if (!isOpen) return null;

  const getFilteredHistories = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    return histories.filter(history => {
      const evaluationDate = new Date(history.evaluationDate);
      switch (selectedPeriod) {
        case '3months':
          return evaluationDate >= threeMonthsAgo;
        case '6months':
          return evaluationDate >= sixMonthsAgo;
        case '1year':
          return evaluationDate >= oneYearAgo;
        default:
          return true;
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateTrend = (histories: EvaluationHistory[]) => {
    if (histories.length < 2) return null;
    const sortedHistories = [...histories].sort((a, b) => 
      new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
    );
    const latestScore = sortedHistories[0].overallScore;
    const previousScore = sortedHistories[1].overallScore;
    const difference = latestScore - previousScore;
    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
      value: Math.abs(difference).toFixed(2),
    };
  };

  const filteredHistories = getFilteredHistories();
  const trend = calculateTrend(filteredHistories);

  const handleExportExcel = () => {
    const exportData = histories.map(history => ({
      '评估日期': history.evaluationDate,
      '评估人': history.evaluator,
      '总评分': history.overallScore.toFixed(1),
      '产品质量': history.categories.qualityScore.toFixed(1),
      '交付表现': history.categories.deliveryScore.toFixed(1),
      '价格竞争力': history.categories.priceScore.toFixed(1),
      '服务质量': history.categories.serviceScore.toFixed(1),
      '合作态度': history.categories.cooperationScore.toFixed(1),
      '改进建议': history.recommendations.join('；'),
      '状态': history.status === 'draft' ? '草稿' :
             history.status === 'published' ? '已发布' : '已归档'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "评估历史");
    XLSX.writeFile(wb, `${supplierName}_评估历史_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPDF = () => {
    // 这里可以添加PDF导出功能
    console.log('Export PDF');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            评估历史记录 - {supplierName}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                导出Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                导出PDF
              </button>
            </div>
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
          {/* 评分趋势 */}
          {trend && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                评分趋势
              </h4>
              <div className="mt-2 flex items-center">
                <span className="text-2xl font-bold">
                  {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                </span>
                <span className={`ml-2 ${
                  trend.direction === 'up' ? 'text-green-600' :
                  trend.direction === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend.value} 分
                </span>
              </div>
            </div>
          )}

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

          {/* 评估记录列表 */}
          <div className="space-y-4">
            {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      评估日期：{history.evaluationDate}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      评估人：{history.evaluator}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(history.overallScore)}`}>
                    {history.overallScore.toFixed(1)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(history.categories).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {key === 'qualityScore' ? '产品质量' :
                         key === 'deliveryScore' ? '交付表现' :
                         key === 'priceScore' ? '价格竞争力' :
                         key === 'serviceScore' ? '服务质量' :
                         '合作态度'}
                      </div>
                      <div className={`text-lg font-semibold ${getScoreColor(value)}`}>
                        {value.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                {history.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      改进建议：
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {history.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
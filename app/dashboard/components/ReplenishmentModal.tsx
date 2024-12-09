'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ReplenishmentSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedAmount: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  historicalData: {
    date: string;
    sales: number;
    stock: number;
    avgDailySales: number;
    lastMonthSales: number;
    stockoutRisk: number;
  }[];
}

interface ReplenishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (suggestions: ReplenishmentSuggestion[]) => void;
  suggestions: ReplenishmentSuggestion[];
}

export default function ReplenishmentModal({
  isOpen,
  onClose,
  onConfirm,
  suggestions,
}: ReplenishmentModalProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const confirmedSuggestions = suggestions.filter(
      suggestion => selectedSuggestions.includes(suggestion.productId)
    );
    onConfirm(confirmedSuggestions);
  };

  const handleToggleSelect = (productId: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSuggestions.length === suggestions.length) {
      setSelectedSuggestions([]);
    } else {
      setSelectedSuggestions(suggestions.map(s => s.productId));
    }
  };

  const getPriorityColor = (priority: ReplenishmentSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: ReplenishmentSuggestion['priority']) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            补货建议
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
          <div className="flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedSuggestions.length === suggestions.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500">
              已选择 {selectedSuggestions.length} 个建议
            </span>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.productId}
                className={`bg-white dark:bg-gray-700 rounded-lg border p-4 ${
                  selectedSuggestions.includes(suggestion.productId)
                    ? 'border-blue-500'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.includes(suggestion.productId)}
                      onChange={() => handleToggleSelect(suggestion.productId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h4 className="text-lg font-medium">{suggestion.productName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        当前库存：{suggestion.currentStock}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(suggestion.priority)}`}>
                    {getPriorityLabel(suggestion.priority)}优先级
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      建议补货数量
                    </h5>
                    <p className="text-2xl font-semibold text-blue-600">
                      {suggestion.suggestedAmount}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {suggestion.reason}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      历史数据趋势
                    </h5>
                    <div className="h-32">
                      <ReactECharts
                        option={{
                          tooltip: {
                            trigger: 'axis',
                          },
                          xAxis: {
                            type: 'category',
                            data: suggestion.historicalData.map(d => d.date),
                            show: false,
                          },
                          yAxis: {
                            type: 'value',
                            show: false,
                          },
                          series: [
                            {
                              name: '库存',
                              type: 'line',
                              data: suggestion.historicalData.map(d => d.stock),
                              smooth: true,
                            },
                            {
                              name: '销量',
                              type: 'bar',
                              data: suggestion.historicalData.map(d => d.sales),
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedSuggestions.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认补货
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
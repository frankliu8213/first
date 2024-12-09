'use client';
import { useState } from 'react';

interface SupplierEvaluation {
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

interface SupplierEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evaluation: SupplierEvaluation) => void;
  supplierName: string;
  supplierId: string;
}

export default function SupplierEvaluationModal({
  isOpen,
  onClose,
  onSave,
  supplierName,
  supplierId,
}: SupplierEvaluationModalProps) {
  const [formData, setFormData] = useState<Omit<SupplierEvaluation, 'id'>>({
    supplierId,
    supplierName,
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluator: '',
    overallScore: 0,
    categories: {
      qualityScore: 0,
      deliveryScore: 0,
      priceScore: 0,
      serviceScore: 0,
      cooperationScore: 0,
    },
    recommendations: [],
    status: 'draft',
  });

  const [newRecommendation, setNewRecommendation] = useState('');

  if (!isOpen) return null;

  const handleScoreChange = (category: keyof typeof formData.categories, value: number) => {
    const newCategories = {
      ...formData.categories,
      [category]: value,
    };

    // 计算总评分（加权平均）
    const weights = {
      qualityScore: 0.3,
      deliveryScore: 0.25,
      priceScore: 0.2,
      serviceScore: 0.15,
      cooperationScore: 0.1,
    };

    const overallScore = Object.entries(newCategories).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
      0
    );

    setFormData({
      ...formData,
      categories: newCategories,
      overallScore,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: Date.now().toString(),
    });
  };

  const handleAddRecommendation = () => {
    if (newRecommendation.trim()) {
      setFormData({
        ...formData,
        recommendations: [...formData.recommendations, newRecommendation.trim()],
      });
      setNewRecommendation('');
    }
  };

  const handleRemoveRecommendation = (index: number) => {
    setFormData({
      ...formData,
      recommendations: formData.recommendations.filter((_, i) => i !== index),
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            供应商评估 - {supplierName}
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
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                评估日期
              </label>
              <input
                type="date"
                value={formData.evaluationDate}
                onChange={(e) => setFormData({ ...formData, evaluationDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                评估人
              </label>
              <input
                type="text"
                value={formData.evaluator}
                onChange={(e) => setFormData({ ...formData, evaluator: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">评分项目</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.categories).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key === 'qualityScore' ? '产品质量' :
                     key === 'deliveryScore' ? '交付表现' :
                     key === 'priceScore' ? '价格竞争力' :
                     key === 'serviceScore' ? '服务质量' :
                     '合作态度'}
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={value}
                      onChange={(e) => handleScoreChange(
                        key as keyof typeof formData.categories,
                        parseFloat(e.target.value)
                      )}
                      className="flex-1"
                    />
                    <span className={`w-12 text-center font-medium ${getScoreColor(value)}`}>
                      {value.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">改进建议</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRecommendation}
                onChange={(e) => setNewRecommendation(e.target.value)}
                placeholder="输入改进建议"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleAddRecommendation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加
              </button>
            </div>
            <ul className="space-y-2">
              {formData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <span>{recommendation}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecommendation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="text-2xl font-bold">
              总评分：
              <span className={getScoreColor(formData.overallScore)}>
                {formData.overallScore.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                保存评估
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';

interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  categories: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
  };
  defaultRecommendations: string[];
  applicableCategories: string[];
}

interface EvaluationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EvaluationTemplate) => void;
  onApply: (templateId: string, suppliers: string[]) => void;
  templates: EvaluationTemplate[];
  supplierCategories: string[];
}

const defaultTemplate: Omit<EvaluationTemplate, 'id'> = {
  name: '',
  description: '',
  categories: {
    qualityScore: 0,
    deliveryScore: 0,
    priceScore: 0,
    serviceScore: 0,
    cooperationScore: 0,
  },
  defaultRecommendations: [],
  applicableCategories: [],
};

export default function EvaluationTemplateModal({
  isOpen,
  onClose,
  onSave,
  onApply,
  templates = [],
  supplierCategories,
}: EvaluationTemplateModalProps) {
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);
  const [selectedSupplierCategories, setSelectedSupplierCategories] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState<Omit<EvaluationTemplate, 'id'>>(defaultTemplate);
  const [newRecommendation, setNewRecommendation] = useState('');

  if (!isOpen) return null;

  const handleSaveTemplate = () => {
    onSave({
      ...newTemplate,
      id: Date.now().toString(),
    });
    setShowNewTemplate(false);
    setNewTemplate(defaultTemplate);
  };

  const handleAddRecommendation = () => {
    if (newRecommendation.trim()) {
      setNewTemplate({
        ...newTemplate,
        defaultRecommendations: [...newTemplate.defaultRecommendations, newRecommendation.trim()],
      });
      setNewRecommendation('');
    }
  };

  const handleRemoveRecommendation = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      defaultRecommendations: newTemplate.defaultRecommendations.filter((_, i) => i !== index),
    });
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate.id, selectedSupplierCategories);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            评估报告模板
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

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setShowNewTemplate(!showNewTemplate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showNewTemplate ? '查看模板列表' : '创建新模板'}
            </button>
          </div>

          {showNewTemplate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  模板名称
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  描述
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">默认评分</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newTemplate.categories).map(([key, value]) => (
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
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            categories: {
                              ...newTemplate.categories,
                              [key]: parseFloat(e.target.value),
                            },
                          })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  适用供应商类别
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {supplierCategories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTemplate.applicableCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTemplate({
                              ...newTemplate,
                              applicableCategories: [...newTemplate.applicableCategories, category],
                            });
                          } else {
                            setNewTemplate({
                              ...newTemplate,
                              applicableCategories: newTemplate.applicableCategories.filter(c => c !== category),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">默认建议</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRecommendation}
                    onChange={(e) => setNewRecommendation(e.target.value)}
                    placeholder="输入默认建议"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
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
                  {newTemplate.defaultRecommendations.map((recommendation, index) => (
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

              <div className="flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存模板
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <div className="mt-2">
                      <div className="text-sm font-medium">适用类别：</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.applicableCategories.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">应用到供应商类别</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {supplierCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSupplierCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSupplierCategories([...selectedSupplierCategories, category]);
                            } else {
                              setSelectedSupplierCategories(
                                selectedSupplierCategories.filter(c => c !== category)
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleApplyTemplate}
                      disabled={selectedSupplierCategories.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      应用模板
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';

interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  minStock: number;
  maxStock: number;
  notifyEmail: boolean;
  notifySystem: boolean;
  categories: string[];
}

interface AlertTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: AlertTemplate) => void;
  onApply: (templateId: string, categories: string[]) => void;
  templates: AlertTemplate[];
  categories: string[];
}

const mockTemplates: AlertTemplate[] = [
  {
    id: '1',
    name: '常规药品预警模板',
    description: '适用于常规药品的库存预警设置',
    minStock: 100,
    maxStock: 1000,
    notifyEmail: true,
    notifySystem: true,
    categories: ['抗生素', '解热镇痛'],
  },
  {
    id: '2',
    name: '特殊药品预警模板',
    description: '适用于特殊管控药品的库存预警设置',
    minStock: 50,
    maxStock: 500,
    notifyEmail: true,
    notifySystem: true,
    categories: ['心血管'],
  },
];

export default function AlertTemplateModal({
  isOpen,
  onClose,
  onSave,
  onApply,
  templates = mockTemplates,
  categories,
}: AlertTemplateModalProps) {
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState<Omit<AlertTemplate, 'id'>>({
    name: '',
    description: '',
    minStock: 100,
    maxStock: 1000,
    notifyEmail: true,
    notifySystem: true,
    categories: [],
  });

  if (!isOpen) return null;

  const handleSaveTemplate = () => {
    onSave({
      ...newTemplate,
      id: Date.now().toString(),
    });
    setShowNewTemplate(false);
    setNewTemplate({
      name: '',
      description: '',
      minStock: 100,
      maxStock: 1000,
      notifyEmail: true,
      notifySystem: true,
      categories: [],
    });
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate.id, selectedCategories);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            预警规则模板
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  模板名称
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最小库存量
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTemplate.minStock}
                    onChange={(e) => setNewTemplate({ ...newTemplate, minStock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大库存量
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTemplate.maxStock}
                    onChange={(e) => setNewTemplate({ ...newTemplate, maxStock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    邮件通知
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newTemplate.notifyEmail}
                      onChange={(e) => setNewTemplate({ ...newTemplate, notifyEmail: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    系统通知
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newTemplate.notifySystem}
                      onChange={(e) => setNewTemplate({ ...newTemplate, notifySystem: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
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
                    <div className="mt-2 text-sm">
                      <div>最小库存: {template.minStock}</div>
                      <div>最大库存: {template.maxStock}</div>
                      <div className="flex gap-2 mt-1">
                        {template.notifyEmail && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            邮件通知
                          </span>
                        )}
                        {template.notifySystem && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            系统通知
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold mb-2">应用到产品类别</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleApplyTemplate}
                      disabled={selectedCategories.length === 0}
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
'use client';
import { useState } from 'react';

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  conditions: {
    minStock: number;
    maxStock: number;
    turnoverRate?: number;
    expiryDays?: number;
  };
  actions: {
    notifyMethods: {
      email: boolean;
      system: boolean;
      sms: boolean;
    };
    frequency: 'realtime' | 'daily' | 'weekly';
    autoReplenish: boolean;
    replenishAmount?: number;
  };
  categories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlertRuleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  categories: string[];
  initialData?: AlertRule;
}

export default function AlertRuleTemplateModal({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
}: AlertRuleTemplateModalProps) {
  const [formData, setFormData] = useState<Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>>(
    initialData ? {
      name: initialData.name,
      description: initialData.description,
      conditions: initialData.conditions,
      actions: initialData.actions,
      categories: initialData.categories,
      isActive: initialData.isActive,
    } : {
      name: '',
      description: '',
      conditions: {
        minStock: 100,
        maxStock: 1000,
        turnoverRate: 2,
        expiryDays: 90,
      },
      actions: {
        notifyMethods: {
          email: true,
          system: true,
          sms: false,
        },
        frequency: 'realtime',
        autoReplenish: false,
        replenishAmount: 500,
      },
      categories: [],
      isActive: true,
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                规则名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                规则描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
          </div>

          {/* 预警条件 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">预警条件</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  最小库存量
                </label>
                <input
                  type="number"
                  value={formData.conditions.minStock}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      minStock: parseInt(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  最大库存量
                </label>
                <input
                  type="number"
                  value={formData.conditions.maxStock}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      maxStock: parseInt(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  周转率阈值
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.conditions.turnoverRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      turnoverRate: parseFloat(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  效期预警天数
                </label>
                <input
                  type="number"
                  value={formData.conditions.expiryDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    conditions: {
                      ...formData.conditions,
                      expiryDays: parseInt(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* 预警动作 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">预警动作</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.actions.notifyMethods.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      notifyMethods: {
                        ...formData.actions.notifyMethods,
                        email: e.target.checked,
                      },
                    },
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">邮件通知</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.actions.notifyMethods.system}
                  onChange={(e) => setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      notifyMethods: {
                        ...formData.actions.notifyMethods,
                        system: e.target.checked,
                      },
                    },
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">系统通知</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.actions.notifyMethods.sms}
                  onChange={(e) => setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      notifyMethods: {
                        ...formData.actions.notifyMethods,
                        sms: e.target.checked,
                      },
                    },
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">短信通知</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                通知频率
              </label>
              <select
                value={formData.actions.frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  actions: {
                    ...formData.actions,
                    frequency: e.target.value as 'realtime' | 'daily' | 'weekly',
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="realtime">实时通知</option>
                <option value="daily">每日汇总</option>
                <option value="weekly">每周汇总</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用自动补货
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actions.autoReplenish}
                  onChange={(e) => setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      autoReplenish: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formData.actions.autoReplenish && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  补货数量
                </label>
                <input
                  type="number"
                  value={formData.actions.replenishAmount}
                  onChange={(e) => setFormData({
                    ...formData,
                    actions: {
                      ...formData.actions,
                      replenishAmount: parseInt(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* 适用类别 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">适用类别</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.categories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
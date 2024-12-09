'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface BatchAlertSettings {
  categories: string[];
  minStock: number;
  maxStock: number;
  isEnabled: boolean;
  notifyMethods: {
    email: boolean;
    system: boolean;
    sms: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
  autoReplenish: boolean;
  replenishAmount: number;
  contacts: string[];
}

interface BatchAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: BatchAlertSettings) => void;
  categories: string[];
}

export default function BatchAlertModal({
  isOpen,
  onClose,
  onSave,
  categories,
}: BatchAlertModalProps) {
  const [settings, setSettings] = useState<BatchAlertSettings>({
    categories: [],
    minStock: 100,
    maxStock: 1000,
    isEnabled: true,
    notifyMethods: {
      email: true,
      system: true,
      sms: false,
    },
    frequency: 'realtime',
    autoReplenish: false,
    replenishAmount: 500,
    contacts: [],
  });

  const [newContact, setNewContact] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const handleAddContact = () => {
    if (newContact && !settings.contacts.includes(newContact)) {
      setSettings({
        ...settings,
        contacts: [...settings.contacts, newContact],
      });
      setNewContact('');
    }
  };

  const handleRemoveContact = (contact: string) => {
    setSettings({
      ...settings,
      contacts: settings.contacts.filter(c => c !== contact),
    });
  };

  const handleCategoryToggle = (category: string) => {
    setSettings({
      ...settings,
      categories: settings.categories.includes(category)
        ? settings.categories.filter(c => c !== category)
        : [...settings.categories, category],
    });
  };

  // 添加分布图配置
  const distributionOption = {
    title: {
      text: '预警设置分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: categories.map(category => ({
          name: category,
          value: settings.categories.includes(category) ? 1 : 0
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            批量预警设置
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
          {/* 类别选择 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">选择产品类别</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    settings.categories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 基本设置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用预警
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isEnabled}
                  onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  最小库存量
                </label>
                <input
                  type="number"
                  value={settings.minStock}
                  onChange={(e) => setSettings({ ...settings, minStock: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  最大库存量
                </label>
                <input
                  type="number"
                  value={settings.maxStock}
                  onChange={(e) => setSettings({ ...settings, maxStock: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">通知设置</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifyMethods.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifyMethods: { ...settings.notifyMethods, email: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">邮件通知</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifyMethods.system}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifyMethods: { ...settings.notifyMethods, system: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">系统通知</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifyMethods.sms}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifyMethods: { ...settings.notifyMethods, sms: e.target.checked }
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
                value={settings.frequency}
                onChange={(e) => setSettings({ ...settings, frequency: e.target.value as 'realtime' | 'daily' | 'weekly' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="realtime">实时通知</option>
                <option value="daily">每日汇总</option>
                <option value="weekly">每周汇总</option>
              </select>
            </div>
          </div>

          {/* 自动补货设置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用自动补货
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoReplenish}
                  onChange={(e) => setSettings({ ...settings, autoReplenish: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.autoReplenish && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  补货数量
                </label>
                <input
                  type="number"
                  value={settings.replenishAmount}
                  onChange={(e) => setSettings({ ...settings, replenishAmount: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* 联系人设置 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">通知联系人</h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="输入邮箱地址"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加
              </button>
            </div>
            <div className="space-y-2">
              {settings.contacts.map((contact) => (
                <div key={contact} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                  <span className="text-sm">{contact}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(contact)}
                    className="text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
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

        {/* 添加图表显示区域 */}
        <div className="mt-6">
          <ReactECharts option={distributionOption} style={{ height: '300px' }} />
        </div>
      </div>
    </div>
  );
} 
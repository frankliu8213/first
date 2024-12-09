'use client';
import { useState } from 'react';

interface ReplenishmentPlan {
  id: string;
  productId: string;
  productName: string;
  planAmount: number;
  expectedDate: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  supplier?: string;
  estimatedCost?: number;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

interface ReplenishmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: ReplenishmentPlan) => void;
  onUpdateStatus: (id: string, status: ReplenishmentPlan['status']) => void;
  plans: ReplenishmentPlan[];
  productName?: string;
}

const mockPlans: ReplenishmentPlan[] = [
  {
    id: '1',
    productId: '1',
    productName: '阿莫西林胶囊',
    planAmount: 500,
    expectedDate: '2024-04-01',
    status: 'scheduled',
    supplier: '供应商A',
    estimatedCost: 12500,
    notes: '季度常规补货',
    priority: 'medium',
    createdAt: '2024-03-20 10:30:00',
    updatedAt: '2024-03-20 10:30:00',
  },
  {
    id: '2',
    productId: '1',
    productName: '阿莫西林胶囊',
    planAmount: 200,
    expectedDate: '2024-03-25',
    status: 'in_progress',
    supplier: '供应商B',
    estimatedCost: 5000,
    notes: '紧急补货',
    priority: 'high',
    createdAt: '2024-03-19 15:45:00',
    updatedAt: '2024-03-20 09:00:00',
  },
];

export default function ReplenishmentPlanModal({
  isOpen,
  onClose,
  onSave,
  onUpdateStatus,
  plans = mockPlans,
  productName,
}: ReplenishmentPlanModalProps) {
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [filter, setFilter] = useState<'all' | ReplenishmentPlan['status']>('all');
  const [newPlan, setNewPlan] = useState<Omit<ReplenishmentPlan, 'id' | 'createdAt' | 'updatedAt'>>({
    productId: '',
    productName: productName || '',
    planAmount: 0,
    expectedDate: '',
    status: 'draft',
    priority: 'medium',
  });

  if (!isOpen) return null;

  const filteredPlans = plans.filter(
    plan => filter === 'all' || plan.status === filter
  );

  const handleSavePlan = () => {
    onSave({
      ...newPlan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ReplenishmentPlan);
    setShowNewPlan(false);
    setNewPlan({
      productId: '',
      productName: productName || '',
      planAmount: 0,
      expectedDate: '',
      status: 'draft',
      priority: 'medium',
    });
  };

  const getStatusColor = (status: ReplenishmentPlan['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: ReplenishmentPlan['status']) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'scheduled':
        return '已计划';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
    }
  };

  const getPriorityColor = (priority: ReplenishmentPlan['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  };

  const getPriorityText = (priority: ReplenishmentPlan['priority']) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            补货计划管理 {productName ? `- ${productName}` : ''}
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
            <div className="flex gap-2">
              {(['all', 'draft', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status === 'all' ? '全部' : getStatusText(status)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewPlan(!showNewPlan)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showNewPlan ? '查看计划列表' : '新建补货计划'}
            </button>
          </div>

          {showNewPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    计划补货数量
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPlan.planAmount}
                    onChange={(e) => setNewPlan({ ...newPlan, planAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    预计到货日期
                  </label>
                  <input
                    type="date"
                    value={newPlan.expectedDate}
                    onChange={(e) => setNewPlan({ ...newPlan, expectedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    供应商
                  </label>
                  <input
                    type="text"
                    value={newPlan.supplier || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    预估成本
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPlan.estimatedCost || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, estimatedCost: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  优先级
                </label>
                <select
                  value={newPlan.priority}
                  onChange={(e) => setNewPlan({ ...newPlan, priority: e.target.value as ReplenishmentPlan['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  备注
                </label>
                <textarea
                  value={newPlan.notes || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存计划
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium">{plan.productName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.notes}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(plan.priority)}`}>
                        {getPriorityText(plan.priority)}优先级
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        计划补货数量
                      </label>
                      <p className="mt-1 text-lg font-semibold">
                        {plan.planAmount}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        预计到货日期
                      </label>
                      <p className="mt-1">
                        {plan.expectedDate}
                      </p>
                    </div>
                    {plan.supplier && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          供应商
                        </label>
                        <p className="mt-1">
                          {plan.supplier}
                        </p>
                      </div>
                    )}
                    {plan.estimatedCost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          预估成本
                        </label>
                        <p className="mt-1">
                          ¥{plan.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {plan.status === 'draft' && (
                    <div className="mt-4 flex justify-end gap-4">
                      <button
                        onClick={() => onUpdateStatus(plan.id, 'scheduled')}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        确认计划
                      </button>
                      <button
                        onClick={() => onUpdateStatus(plan.id, 'cancelled')}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        取消
                      </button>
                    </div>
                  )}

                  {plan.status === 'scheduled' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => onUpdateStatus(plan.id, 'in_progress')}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        开始执行
                      </button>
                    </div>
                  )}

                  {plan.status === 'in_progress' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => onUpdateStatus(plan.id, 'completed')}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-700"
                      >
                        标记完成
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
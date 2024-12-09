'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface RiskFactor {
  id: string;
  name: string;
  category: '供应链' | '财务' | '质量' | '合规' | '运营';
  level: 'high' | 'medium' | 'low';
  score: number;
  impact: number;
  probability: number;
  description: string;
  mitigationPlan?: string;
  status: 'active' | 'mitigated' | 'monitoring';
  lastAssessment: string;
  nextAssessment: string;
  trends: {
    date: string;
    score: number;
  }[];
}

interface RiskAssessment {
  overallRisk: number;
  riskFactors: RiskFactor[];
  riskDistribution: {
    category: string;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  }[];
  riskTrends: {
    date: string;
    score: number;
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

interface SupplierRiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  data: RiskAssessment;
}

const mockData: RiskAssessment = {
  overallRisk: 3.2,
  riskFactors: [
    {
      id: '1',
      name: '供应链中断',
      category: '供应链',
      level: 'high',
      score: 4.2,
      impact: 4,
      probability: 3,
      description: '主要原材料供应商集中度高，存在供应中断风险',
      mitigationPlan: '开发备选供应商，建立安全库存',
      status: 'active',
      lastAssessment: '2024-03-01',
      nextAssessment: '2024-04-01',
      trends: [
        { date: '2024-01', score: 4.5 },
        { date: '2024-02', score: 4.3 },
        { date: '2024-03', score: 4.2 },
      ],
    },
    // 可以添加更多风险因素...
  ],
  riskDistribution: [
    {
      category: '供应链',
      highRisk: 2,
      mediumRisk: 3,
      lowRisk: 1,
    },
    {
      category: '财务',
      highRisk: 1,
      mediumRisk: 2,
      lowRisk: 3,
    },
    {
      category: '质量',
      highRisk: 0,
      mediumRisk: 4,
      lowRisk: 2,
    },
    {
      category: '合规',
      highRisk: 1,
      mediumRisk: 1,
      lowRisk: 4,
    },
    {
      category: '运营',
      highRisk: 1,
      mediumRisk: 2,
      lowRisk: 2,
    },
  ],
  riskTrends: [
    { date: '2024-01', score: 3.5 },
    { date: '2024-02', score: 3.3 },
    { date: '2024-03', score: 3.2 },
  ],
  recommendations: [
    {
      priority: 'high',
      action: '开发备选供应商',
      impact: '降低供应链中断风险',
      deadline: '2024-06-30',
      status: 'in_progress',
    },
    {
      priority: 'medium',
      action: '优化库存管理',
      impact: '降低库存成本',
      deadline: '2024-05-31',
      status: 'pending',
    },
  ],
};

export default function SupplierRiskAssessmentModal({
  isOpen,
  onClose,
  supplierName,
  data = mockData,
}: SupplierRiskAssessmentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  if (!isOpen) return null;

  // 风险趋势图配置
  const trendOption = {
    title: {
      text: '风险趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.riskTrends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
      name: '风险分数',
      min: 0,
      max: 5,
    },
    series: [
      {
        name: '风险分数',
        type: 'line',
        data: data.riskTrends.map(t => t.score),
        smooth: true,
        markLine: {
          data: [
            { yAxis: 4, lineStyle: { color: '#F56C6C' }, label: { formatter: '高风险' } },
            { yAxis: 3, lineStyle: { color: '#E6A23C' }, label: { formatter: '中风险' } },
            { yAxis: 2, lineStyle: { color: '#67C23A' }, label: { formatter: '低风险' } },
          ],
        },
      },
    ],
  };

  // 风险分布图配置
  const distributionOption = {
    title: {
      text: '风险分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['高风险', '中风险', '低风险'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.riskDistribution.map(d => d.category),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '高风险',
        type: 'bar',
        stack: 'total',
        data: data.riskDistribution.map(d => d.highRisk),
        itemStyle: { color: '#F56C6C' },
      },
      {
        name: '中风险',
        type: 'bar',
        stack: 'total',
        data: data.riskDistribution.map(d => d.mediumRisk),
        itemStyle: { color: '#E6A23C' },
      },
      {
        name: '低风险',
        type: 'bar',
        stack: 'total',
        data: data.riskDistribution.map(d => d.lowRisk),
        itemStyle: { color: '#67C23A' },
      },
    ],
  };

  const getRiskLevelColor = (level: RiskFactor['level']) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: RiskFactor['status']) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'mitigated': return 'text-green-600 bg-green-100';
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: 'pending' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            风险评估 - {supplierName}
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
          {/* 风险概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                整体风险评分
              </h4>
              <p className={`text-2xl font-semibold mt-2 ${
                data.overallRisk >= 4 ? 'text-red-600' :
                data.overallRisk >= 3 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {data.overallRisk.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                高风险因素
              </h4>
              <p className="text-2xl font-semibold mt-2 text-red-600">
                {data.riskFactors.filter(f => f.level === 'high').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                待处理建议
              </h4>
              <p className="text-2xl font-semibold mt-2 text-yellow-600">
                {data.recommendations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                已完成改进
              </h4>
              <p className="text-2xl font-semibold mt-2 text-green-600">
                {data.recommendations.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={distributionOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 风险因素列表 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">风险因素</h4>
            <div className="space-y-4">
              {data.riskFactors.map((factor) => (
                <div
                  key={factor.id}
                  className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold">
                        {factor.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        类别：{factor.category}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelColor(factor.level)}`}>
                        {factor.level === 'high' ? '高风险' :
                         factor.level === 'medium' ? '中风险' : '低风险'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(factor.status)}`}>
                        {factor.status === 'active' ? '活跃' :
                         factor.status === 'mitigated' ? '已缓解' : '监控中'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">风险评分</div>
                      <div className="mt-1 text-lg font-semibold">
                        {factor.score.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">影响程度</div>
                      <div className="mt-1 text-lg font-semibold">
                        {factor.impact.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">发生概率</div>
                      <div className="mt-1 text-lg font-semibold">
                        {factor.probability.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">风险描述</div>
                    <div className="mt-1">
                      {factor.description}
                    </div>
                  </div>

                  {factor.mitigationPlan && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">缓解计划</div>
                      <div className="mt-1">
                        {factor.mitigationPlan}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div>上次评估：{factor.lastAssessment}</div>
                    <div>下次评估：{factor.nextAssessment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 改进建议 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">改进建议</h4>
            <div className="space-y-4">
              {data.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold">
                        {recommendation.action}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        预期影响：{recommendation.impact}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority === 'high' ? '高优先级' :
                         recommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        recommendation.status === 'completed' ? 'text-green-600 bg-green-100' :
                        recommendation.status === 'in_progress' ? 'text-blue-600 bg-blue-100' :
                        'text-yellow-600 bg-yellow-100'
                      }`}>
                        {getStatusLabel(recommendation.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    截止日期：{recommendation.deadline}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
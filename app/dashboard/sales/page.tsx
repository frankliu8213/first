'use client';
import { useState } from 'react';
import SalesTrendAnalysisModal from '../components/SalesTrendAnalysisModal';
import SalesForecastModal from '../components/SalesForecastModal';
import SalesProfitAnalysisModal from '../components/SalesProfitAnalysisModal';
import SalesRegionAnalysisModal from '../components/SalesRegionAnalysisModal';
import SalesCustomerAnalysisModal from '../components/SalesCustomerAnalysisModal';
import SalesChannelAnalysisModal from '../components/SalesChannelAnalysisModal';
import SalesReturnAnalysisModal from '../components/SalesReturnAnalysisModal';
import SalesRankingAnalysisModal from '../components/SalesRankingAnalysisModal';
import SalesPerformanceAnalysisModal from '../components/SalesPerformanceAnalysisModal';
import ReactECharts from 'echarts-for-react';

// 模拟数据
const mockSalesData = {
  today: {
    amount: 12345,
    comparison: '+15.2%',
    comparisonLabel: '较昨日',
  },
  week: {
    amount: 89567,
    comparison: '-2.3%',
    comparisonLabel: '较上周',
  },
  month: {
    amount: 356789,
    comparison: '+8.7%',
    comparisonLabel: '较上月',
  },
  quarter: {
    amount: 1234567,
    comparison: '+12.4%',
    comparisonLabel: '较上季',
  },
};

const mockTrendData = Array.from({ length: 7 }, (_, i) => ({
  date: `2024-03-${(i + 1).toString().padStart(2, '0')}`,
  revenue: Math.random() * 10000 + 5000,
  volume: Math.floor(Math.random() * 100) + 50,
  profit: Math.random() * 3000 + 1000,
  averagePrice: Math.random() * 100 + 50,
  categories: [
    { name: '抗生素', revenue: Math.random() * 5000, volume: Math.random() * 50 },
    { name: '解热镇痛', revenue: Math.random() * 3000, volume: Math.random() * 30 },
  ],
  channels: [
    { name: '医院', revenue: Math.random() * 6000, percentage: Math.random() * 0.4 },
    { name: '药店', revenue: Math.random() * 4000, percentage: Math.random() * 0.3 },
  ],
  topProducts: [
    { name: '阿莫西林', revenue: Math.random() * 2000, volume: Math.random() * 20, growth: Math.random() * 20 - 10 },
    { name: '布洛芬', revenue: Math.random() * 1500, volume: Math.random() * 15, growth: Math.random() * 15 - 7.5 },
  ],
}));

const mockForecastData = [
  {
    productId: '1',
    productName: '阿莫西林胶囊',
    currentSales: 12500,
    forecastedSales: 15000,
    growthRate: 20,
    confidence: 85,
    seasonality: [
      { period: '春季', impact: 0.2 },
      { period: '夏季', impact: -0.1 },
      { period: '秋季', impact: 0.15 },
      { period: '冬季', impact: 0.25 },
    ],
    factors: [
      { name: '季节性需求', impact: 15, description: '冬季流感季节影响' },
      { name: '市场竞争', impact: -5, description: '新竞品上市' },
      { name: '促销活动', impact: 10, description: '节假日促销' },
    ],
    trends: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      actual: Math.random() * 2000 + 8000,
      forecast: Math.random() * 2000 + 9000,
      lowerBound: Math.random() * 1000 + 7000,
      upperBound: Math.random() * 3000 + 10000,
    })),
  },
];

// 添加利润分析模拟数据
const mockProfitData = Array.from({ length: 12 }, (_, i) => ({
  date: `2024-${(i + 1).toString().padStart(2, '0')}`,
  revenue: Math.random() * 100000 + 50000,
  cost: Math.random() * 70000 + 30000,
  profit: 0,
  profitRate: 0,
  categories: [
    { name: '抗生素', revenue: Math.random() * 50000, cost: Math.random() * 30000, profit: 0, profitRate: 0 },
    { name: '解热镇痛', revenue: Math.random() * 30000, cost: Math.random() * 20000, profit: 0, profitRate: 0 },
  ],
  products: [
    { name: '阿莫西林胶囊', revenue: Math.random() * 20000, cost: Math.random() * 12000, profit: 0, profitRate: 0, trend: Math.random() * 20 - 10 },
    { name: '布洛芬片', revenue: Math.random() * 15000, cost: Math.random() * 9000, profit: 0, profitRate: 0, trend: Math.random() * 20 - 10 },
  ],
  factors: [
    { name: '材料成本', impact: -5, description: '主要原料价格上涨' },
    { name: '规模效应', impact: 3, description: '批量采购优惠' },
    { name: '运营效率', impact: 2, description: '流程优化' },
  ],
})).map(item => {
  // 计算利润和利润率
  const calcProfit = (rev: number, cost: number) => ({ 
    profit: rev - cost,
    profitRate: (rev - cost) / rev
  });
  
  const mainCalc = calcProfit(item.revenue, item.cost);
  item.profit = mainCalc.profit;
  item.profitRate = mainCalc.profitRate;
  
  // 计算分类利润
  item.categories = item.categories.map(cat => {
    const catCalc = calcProfit(cat.revenue, cat.cost);
    return { ...cat, ...catCalc };
  });
  
  // 计算产品利润
  item.products = item.products.map(prod => {
    const prodCalc = calcProfit(prod.revenue, prod.cost);
    return { ...prod, ...prodCalc };
  });
  
  return item;
});

// 添加区域销售模拟数据
const mockRegionData = [
  {
    region: '华东',
    sales: 1234567,
    growth: 15.2,
    marketShare: 35.8,
    products: [
      { name: '阿莫西林胶囊', sales: 450000, percentage: 36.5 },
      { name: '布洛芬片', sales: 320000, percentage: 25.9 },
    ],
    channels: [
      { name: '医院', sales: 800000, percentage: 64.8 },
      { name: '药店', sales: 300000, percentage: 24.3 },
      { name: '电商', sales: 134567, percentage: 10.9 },
    ],
    trends: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      sales: Math.random() * 200000 + 800000,
      target: 1000000,
    })),
  },
  // ... 可以添加更多区域数据
];

// 添加客户分析模拟数据
const mockCustomerData = [
  {
    id: '1',
    name: '医院A',
    type: '医院',
    totalPurchase: 1234567,
    orderCount: 156,
    averageOrderValue: 7915.17,
    lastPurchaseDate: '2024-03-20',
    purchaseFrequency: 7,
    lifetimeValue: 2345678,
    productPreferences: [
      { category: '抗生素', amount: 450000, percentage: 36.5 },
      { category: '解热镇痛', amount: 320000, percentage: 25.9 },
      { category: '维生素', amount: 250000, percentage: 20.2 },
      { category: '心血管', amount: 150000, percentage: 12.1 },
      { category: '消化系统', amount: 64567, percentage: 5.3 },
    ],
    purchaseHistory: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      amount: Math.random() * 150000 + 50000,
      products: Math.floor(Math.random() * 50) + 20,
    })),
    riskLevel: 'low' as const,
    retentionScore: 85,
  },
  // ... 可以添加更多客户数据
];

// 添加渠道分析模拟数据
const mockChannelData = [
  {
    id: '1',
    name: '医院',
    sales: 1234567,
    growth: 15.2,
    marketShare: 45.8,
    products: [
      { name: '阿莫西林胶囊', sales: 450000, percentage: 36.5 },
      { name: '布洛芬片', sales: 320000, percentage: 25.9 },
    ],
    customers: [
      { type: '三甲医院', count: 50, sales: 800000, percentage: 64.8 },
      { type: '二甲医院', count: 80, sales: 300000, percentage: 24.3 },
      { type: '社区医院', count: 120, sales: 134567, percentage: 10.9 },
    ],
    trends: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      sales: Math.random() * 200000 + 800000,
      target: 1000000,
    })),
    performance: [
      { metric: '客户满意度', value: 92, target: 90, status: 'good' as const },
      { metric: '订单完成率', value: 95, target: 95, status: 'good' as const },
      { metric: '退货率', value: 2.5, target: 3, status: 'good' as const },
    ],
  },
  // ... 可以添加更多渠道数据
];

// 修改退货分析模拟数据的生成方式
const mockReturnData = Array.from({ length: 50 }, (_, i) => {
  const statuses = ['pending', 'approved', 'rejected', 'completed'] as const;
  return {
    id: (i + 1).toString(),
    productName: ['阿莫西林胶囊', '布洛芬片', '维生素C片'][Math.floor(Math.random() * 3)],
    returnDate: `2024-${(Math.floor(Math.random() * 3) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
    quantity: Math.floor(Math.random() * 50) + 10,
    amount: Math.floor(Math.random() * 5000) + 1000,
    reason: ['质量问题', '包装破损', '过期', '其他'][Math.floor(Math.random() * 4)],
    category: ['抗生素', '解热镇痛', '维生素'][Math.floor(Math.random() * 3)],
    supplier: ['供应商A', '供应商B', '供应商C'][Math.floor(Math.random() * 3)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    processingTime: Math.floor(Math.random() * 48) + 1,
    qualityIssue: Math.random() > 0.7,
    batchNumber: `BN${Math.floor(Math.random() * 1000)}`,
    customerFeedback: Math.random() > 0.5 ? '产品质量不符合预期' : undefined,
  };
});

// 添加排名分析模拟数据
const mockRankingData = [
  {
    productId: '1',
    productName: '阿莫西林胶囊',
    category: '抗生素',
    sales: 12500,
    revenue: 450000,
    growth: 15.2,
    marketShare: 8.5,
    profitMargin: 25.8,
    trends: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      sales: Math.floor(Math.random() * 2000 + 10000),
      revenue: Math.random() * 100000 + 350000,
    })),
    customers: [
      { type: '医院', sales: 8000, percentage: 64 },
      { type: '药店', sales: 3000, percentage: 24 },
      { type: '诊所', sales: 1500, percentage: 12 },
    ],
    regions: [
      { name: '华东', sales: 5000, percentage: 40 },
      { name: '华南', sales: 3000, percentage: 24 },
      { name: '华北', sales: 2500, percentage: 20 },
      { name: '西部', sales: 2000, percentage: 16 },
    ],
  },
  // ... 可以添加更多产品数据
];

// 修改绩效分析模拟数据
const mockPerformanceData: {
  period: string;
  metrics: {
    revenue: number;
    profit: number;
    orderCount: number;
    averageOrderValue: number;
    customerCount: number;
    newCustomerCount: number;
    repeatPurchaseRate: number;
    productCategories: {
      name: string;
      revenue: number;
      percentage: number;
    }[];
    salesChannels: {
      name: string;
      revenue: number;
      percentage: number;
    }[];
    salesTeam: {
      name: string;
      revenue: number;
      target: number;
      achievement: number;
    }[];
  };
  kpis: {
    name: string;
    actual: number;
    target: number;
    status: 'exceeded' | 'met' | 'below';
  }[];
  trends: {
    date: string;
    revenue: number;
    profit: number;
    orders: number;
  }[];
} = {
  period: '2024-03',
  metrics: {
    revenue: 1234567,
    profit: 345678,
    orderCount: 567,
    averageOrderValue: 2177.37,
    customerCount: 456,
    newCustomerCount: 89,
    repeatPurchaseRate: 45.6,
    productCategories: [
      { name: '抗生素', revenue: 450000, percentage: 36.5 },
      { name: '解热镇痛', revenue: 320000, percentage: 25.9 },
      { name: '维生素', revenue: 250000, percentage: 20.2 },
      { name: '心血管', revenue: 150000, percentage: 12.1 },
      { name: '消化系统', revenue: 64567, percentage: 5.3 },
    ],
    salesChannels: [
      { name: '医院', revenue: 800000, percentage: 64.8 },
      { name: '药店', revenue: 300000, percentage: 24.3 },
      { name: '电商', revenue: 134567, percentage: 10.9 },
    ],
    salesTeam: [
      { name: '团队A', revenue: 500000, target: 450000, achievement: 111.1 },
      { name: '团队B', revenue: 400000, target: 400000, achievement: 100.0 },
      { name: '团队C', revenue: 334567, target: 350000, achievement: 95.6 },
    ],
  },
  kpis: [
    { name: '销售目标', actual: 1234567, target: 1200000, status: 'exceeded' },
    { name: '利润率', actual: 28, target: 25, status: 'exceeded' },
    { name: '新客户数', actual: 89, target: 100, status: 'below' },
    { name: '客单价', actual: 2177, target: 2000, status: 'met' },
  ],
  trends: Array.from({ length: 12 }, (_, i) => ({
    date: `2024-${(i + 1).toString().padStart(2, '0')}`,
    revenue: Math.random() * 200000 + 800000,
    profit: Math.random() * 80000 + 240000,
    orders: Math.floor(Math.random() * 100) + 400,
  })),
};

export default function SalesAnalysis() {
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  // 销售趋势图配置
  const trendOption = {
    title: {
      text: '销售趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['销售额', '销量'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额（元）',
      },
      {
        type: 'value',
        name: '销量',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: [150, 130, 140, 160, 180, 170, 155],
      },
      {
        name: '销量',
        type: 'bar',
        yAxisIndex: 1,
        data: [120, 110, 125, 145, 160, 150, 130],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">销售分析</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowTrendModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            趋势分析
          </button>
          <button
            onClick={() => setShowForecastModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            销售预测
          </button>
          <button
            onClick={() => setShowProfitModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            利润分析
          </button>
          <button
            onClick={() => setShowRegionModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            区域分析
          </button>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            客户分析
          </button>
          <button
            onClick={() => setShowChannelModal(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
          >
            渠道分析
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            退货分析
          </button>
          <button
            onClick={() => setShowRankingModal(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            排名分析
          </button>
          <button
            onClick={() => setShowPerformanceModal(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
          >
            绩效分析
          </button>
        </div>
      </div>

      {/* 销售概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(mockSalesData).map(([period, data]) => (
          <div key={period} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {period === 'today' ? '今日销售额' :
               period === 'week' ? '本周销售额' :
               period === 'month' ? '本月销售额' : '本季销售额'}
            </h3>
            <p className="text-2xl font-semibold mt-2">
              ¥{data.amount.toLocaleString()}
            </p>
            <span className={`text-sm ${
              data.comparison.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.comparison} {data.comparisonLabel}
            </span>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <ReactECharts option={trendOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* 模态框 */}
      <SalesTrendAnalysisModal
        isOpen={showTrendModal}
        onClose={() => setShowTrendModal(false)}
        data={mockTrendData}
      />

      <SalesForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        data={mockForecastData}
      />

      <SalesProfitAnalysisModal
        isOpen={showProfitModal}
        onClose={() => setShowProfitModal(false)}
        data={mockProfitData}
      />

      <SalesRegionAnalysisModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        data={mockRegionData}
      />

      <SalesCustomerAnalysisModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        data={mockCustomerData}
      />

      <SalesChannelAnalysisModal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        data={mockChannelData}
      />

      <SalesReturnAnalysisModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        data={mockReturnData}
      />

      <SalesRankingAnalysisModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        data={mockRankingData}
      />

      <SalesPerformanceAnalysisModal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        data={mockPerformanceData}
      />
    </div>
  );
} 
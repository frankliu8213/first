'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface SupplierAnalysis {
  overview: {
    totalOrders: number;
    totalAmount: number;
    averageOrderValue: number;
    returnRate: number;
    qualityScore: number;
    deliveryScore: number;
  };
  trends: {
    date: string;
    orderCount: number;
    orderAmount: number;
    qualityScore: number;
    deliveryScore: number;
  }[];
  productAnalysis: {
    productName: string;
    orderCount: number;
    amount: number;
    percentage: number;
  }[];
  qualityMetrics: {
    metric: string;
    value: number;
    benchmark: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  riskAssessment: {
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

interface SupplierAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  data: SupplierAnalysis;
}

const mockData: SupplierAnalysis = {
  overview: {
    totalOrders: 156,
    totalAmount: 1250000,
    averageOrderValue: 8012.82,
    returnRate: 0.8,
    qualityScore: 4.5,
    deliveryScore: 4.2,
  },
  trends: [
    { date: '2024-01', orderCount: 45, orderAmount: 380000, qualityScore: 4.4, deliveryScore: 4.1 },
    { date: '2024-02', orderCount: 52, orderAmount: 420000, qualityScore: 4.5, deliveryScore: 4.2 },
    { date: '2024-03', orderCount: 59, orderAmount: 450000, qualityScore: 4.6, deliveryScore: 4.3 },
  ],
  productAnalysis: [
    { productName: '阿莫西林胶囊', orderCount: 45, amount: 450000, percentage: 36 },
    { productName: '布洛芬片', orderCount: 32, amount: 300000, percentage: 24 },
    { productName: '维生素C片', orderCount: 28, amount: 250000, percentage: 20 },
    { productName: '辛伐他汀片', orderCount: 15, amount: 150000, percentage: 12 },
    { productName: '奥美拉唑胶囊', orderCount: 12, amount: 100000, percentage: 8 },
  ],
  qualityMetrics: [
    { metric: '产品合格率', value: 99.5, benchmark: 99.0, trend: 'up' },
    { metric: '准时交付率', value: 98.0, benchmark: 95.0, trend: 'stable' },
    { metric: '文档完整性', value: 97.5, benchmark: 95.0, trend: 'up' },
    { metric: '客户满意度', value: 4.5, benchmark: 4.0, trend: 'up' },
  ],
  riskAssessment: [
    { factor: '供应稳定性', level: 'low', description: '供应链稳定，无重大风险' },
    { factor: '质量控制', level: 'low', description: '质量管理体系完善' },
    { factor: '价格波动', level: 'medium', description: '原材料价格存在波动风险' },
    { factor: '合规性', level: 'low', description: '各项资质齐全，定期更新' },
  ],
};

export default function SupplierAnalysisModal({
  isOpen,
  onClose,
  supplierName,
  data = mockData,
}: SupplierAnalysisModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('3months');

  if (!isOpen) return null;

  // 趋势图配置
  const trendOption = {
    title: {
      text: '订单趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['订单数量', '订单金额', '质量评分', '交付评分'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: data.trends.map(t => t.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量/金额',
      },
      {
        type: 'value',
        name: '评分',
        max: 5,
        min: 0,
      },
    ],
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: data.trends.map(t => t.orderCount),
      },
      {
        name: '订单金额',
        type: 'bar',
        data: data.trends.map(t => t.orderAmount),
      },
      {
        name: '质量评分',
        type: 'line',
        yAxisIndex: 1,
        data: data.trends.map(t => t.qualityScore),
      },
      {
        name: '交付评分',
        type: 'line',
        yAxisIndex: 1,
        data: data.trends.map(t => t.deliveryScore),
      },
    ],
  };

  // 产品分析饼图配置
  const productOption = {
    title: {
      text: '产品订单分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.productAnalysis.map(p => ({
          name: p.productName,
          value: p.amount,
        })),
      },
    ],
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 概览数据
    const overviewData = [
      {
        '指标': '总订单数',
        '数值': data.overview.totalOrders,
      },
      {
        '指标': '总金额',
        '数值': data.overview.totalAmount,
      },
      {
        '指标': '平均订单金额',
        '数值': data.overview.averageOrderValue,
      },
      {
        '指标': '退货率',
        '数值': `${data.overview.returnRate}%`,
      },
      {
        '指标': '质量评分',
        '数值': data.overview.qualityScore,
      },
      {
        '指标': '交付评分',
        '数值': data.overview.deliveryScore,
      },
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, '概览');

    // 产品分析数据
    const wsProducts = XLSX.utils.json_to_sheet(data.productAnalysis);
    XLSX.utils.book_append_sheet(wb, wsProducts, '产品分析');

    // 质量指标数据
    const wsQuality = XLSX.utils.json_to_sheet(data.qualityMetrics);
    XLSX.utils.book_append_sheet(wb, wsQuality, '质量指标');

    // 风险评估数据
    const wsRisk = XLSX.utils.json_to_sheet(data.riskAssessment);
    XLSX.utils.book_append_sheet(wb, wsRisk, '风险评估');

    XLSX.writeFile(wb, `${supplierName}_分析报告_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(16);
    doc.text(`供应商分析报告 - ${supplierName}`, 105, 15, { align: 'center' });
    
    // 添加概览数据
    doc.setFontSize(14);
    doc.text('基本概况', 14, 30);
    
    const overviewData = [
      ['指标', '数值'],
      ['总订单数', data.overview.totalOrders.toString()],
      ['总金额', `¥${data.overview.totalAmount.toLocaleString()}`],
      ['平均订单金额', `¥${data.overview.averageOrderValue.toLocaleString()}`],
      ['退货率', `${data.overview.returnRate}%`],
      ['质量评分', data.overview.qualityScore.toString()],
      ['交付评分', data.overview.deliveryScore.toString()],
    ];

    (doc as any).autoTable({
      startY: 35,
      head: [['指标', '数值']],
      body: overviewData.slice(1),
      theme: 'grid',
    });

    // 添加产品分析
    doc.setFontSize(14);
    doc.text('产品分析', 14, (doc as any).lastAutoTable.finalY + 15);

    const productData = data.productAnalysis.map(p => [
      p.productName,
      p.orderCount.toString(),
      `¥${p.amount.toLocaleString()}`,
      `${p.percentage}%`,
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['产品名称', '订单数量', '金额', '占比']],
      body: productData,
      theme: 'grid',
    });

    // 添加风险评估
    doc.setFontSize(14);
    doc.text('风险评估', 14, (doc as any).lastAutoTable.finalY + 15);

    const riskData = data.riskAssessment.map(r => [
      r.factor,
      r.level,
      r.description,
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['风险因素', '风险等级', '描述']],
      body: riskData,
      theme: 'grid',
    });

    doc.save(`${supplierName}_分析报告_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            供应商分析报告 - {supplierName}
          </h3>
          <div className="flex items-center gap-4">
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
          {/* 概览指标 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总订单数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.overview.totalOrders}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{(data.overview.totalAmount / 10000).toFixed(1)}万
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均订单金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{data.overview.averageOrderValue.toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                退货率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.overview.returnRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                质量评分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.overview.qualityScore}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                交付评分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {data.overview.deliveryScore}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={productOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 质量指标 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">质量指标</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.qualityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div>
                    <div className="font-medium">{metric.metric}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      基准值：{metric.benchmark}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">
                      {metric.value}
                    </div>
                    <div className={`text-sm ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 风险评估 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">风险评估</h4>
            <div className="space-y-4">
              {data.riskAssessment.map((risk, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div>
                    <div className="font-medium">{risk.factor}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {risk.description}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelColor(risk.level)}`}>
                    {risk.level === 'low' ? '低风险' :
                     risk.level === 'medium' ? '中等风险' : '高风险'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
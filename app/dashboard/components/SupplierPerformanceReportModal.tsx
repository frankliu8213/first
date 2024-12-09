'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PerformanceReport {
  supplierId: string;
  supplierName: string;
  reportPeriod: string;
  overallScore: number;
  metrics: {
    qualityMetrics: {
      defectRate: number;
      returnRate: number;
      qualityScore: number;
      inspectionPassRate: number;
      trends: { date: string; value: number }[];
    };
    deliveryMetrics: {
      onTimeDeliveryRate: number;
      leadTime: number;
      deliveryScore: number;
      orderFulfillmentRate: number;
      trends: { date: string; value: number }[];
    };
    costMetrics: {
      costSavings: number;
      priceCompetitiveness: number;
      costScore: number;
      paymentCompliance: number;
      trends: { date: string; value: number }[];
    };
    serviceMetrics: {
      responseTime: number;
      communicationScore: number;
      serviceScore: number;
      problemResolutionRate: number;
      trends: { date: string; value: number }[];
    };
  };
  comparisonData: {
    category: string;
    supplierScore: number;
    industryAverage: number;
    bestInClass: number;
  }[];
  recommendations: {
    category: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }[];
  historicalScores: {
    date: string;
    score: number;
  }[];
}

interface SupplierPerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  report: PerformanceReport;
}

export default function SupplierPerformanceReportModal({
  isOpen,
  onClose,
  supplierName,
  report,
}: SupplierPerformanceReportModalProps) {
  const [selectedMetric, setSelectedMetric] = useState<'quality' | 'delivery' | 'cost' | 'service'>('quality');

  if (!isOpen) return null;

  // 绩效雷达图配置
  const radarOption = {
    title: {
      text: '绩效对标分析',
      left: 'center',
    },
    legend: {
      data: ['供应商得分', '行业平均', '最佳表现'],
      bottom: 0,
    },
    radar: {
      indicator: report.comparisonData.map(item => ({
        name: item.category,
        max: 5,
      })),
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: report.comparisonData.map(item => item.supplierScore),
          name: '供应商得分',
        },
        {
          value: report.comparisonData.map(item => item.industryAverage),
          name: '行业平均',
        },
        {
          value: report.comparisonData.map(item => item.bestInClass),
          name: '最佳表现',
        },
      ],
    }],
  };

  // 历史趋势图配置
  const trendOption = {
    title: {
      text: '历史表现趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: report.historicalScores.map(item => item.date),
    },
    yAxis: {
      type: 'value',
      name: '得分',
      max: 5,
    },
    series: [{
      data: report.historicalScores.map(item => item.score),
      type: 'line',
      smooth: true,
    }],
  };

  const getMetricTrendOption = (metricType: 'quality' | 'delivery' | 'cost' | 'service') => {
    const metrics = {
      quality: report.metrics.qualityMetrics,
      delivery: report.metrics.deliveryMetrics,
      cost: report.metrics.costMetrics,
      service: report.metrics.serviceMetrics,
    }[metricType];

    return {
      title: {
        text: `${
          metricType === 'quality' ? '质量' :
          metricType === 'delivery' ? '交付' :
          metricType === 'cost' ? '成本' : '服务'
        }指标趋势`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: metrics.trends.map(item => item.date),
      },
      yAxis: {
        type: 'value',
      },
      series: [{
        data: metrics.trends.map(item => item.value),
        type: 'line',
        smooth: true,
      }],
    };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(20);
    doc.text(`${supplierName} - 绩效评估报告`, 105, 20, { align: 'center' });
    
    // 添加基本信息
    doc.setFontSize(12);
    doc.text(`评估期间：${report.reportPeriod}`, 20, 40);
    doc.text(`总评分：${report.overallScore.toFixed(1)}`, 20, 50);

    // 添加指标详情
    doc.setFontSize(14);
    doc.text('指标详情', 20, 70);
    
    const metricsData = [
      ['指标类别', '得分', '行业平均', '差距'],
      ...report.comparisonData.map(item => [
        item.category,
        item.supplierScore.toFixed(1),
        item.industryAverage.toFixed(1),
        (item.supplierScore - item.industryAverage).toFixed(1),
      ]),
    ];

    (doc as any).autoTable({
      startY: 80,
      head: [metricsData[0]],
      body: metricsData.slice(1),
    });

    // 添加改进建议
    doc.text('改进建议', 20, (doc as any).lastAutoTable.finalY + 20);
    
    const recommendationsData = report.recommendations.map(rec => [
      rec.category,
      rec.content,
      rec.priority,
      rec.expectedImpact,
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['类别', '建议内容', '优先级', '预期影响']],
      body: recommendationsData,
    });

    doc.save(`${supplierName}_绩效评估报告_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            绩效评估报告 - {supplierName}
          </h3>
          <div className="flex items-center gap-4">
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
          {/* 评估概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总评分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {report.overallScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                质量得分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {report.metrics.qualityMetrics.qualityScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                交付得分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {report.metrics.deliveryMetrics.deliveryScore.toFixed(1)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                成本得分
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {report.metrics.costMetrics.costScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={radarOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 指标详情 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">指标详情</h4>
            <div className="flex gap-2">
              {(['quality', 'delivery', 'cost', 'service'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedMetric === metric
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {metric === 'quality' ? '质量指标' :
                   metric === 'delivery' ? '交付指标' :
                   metric === 'cost' ? '成本指标' : '服务指标'}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={getMetricTrendOption(selectedMetric)} style={{ height: '300px' }} />
            </div>
          </div>

          {/* 改进建议 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">改进建议</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{rec.category}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {rec.content}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority === 'high' ? '高优先级' :
                       rec.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    预期影响：{rec.expectedImpact}
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
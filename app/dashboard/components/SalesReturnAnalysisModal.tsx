'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface ReturnData {
  id: string;
  productName: string;
  returnDate: string;
  quantity: number;
  amount: number;
  reason: string;
  category: string;
  supplier: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  processingTime: number;
  qualityIssue: boolean;
  batchNumber?: string;
  customerFeedback?: string;
}

interface ReturnAnalysis {
  totalReturns: number;
  totalAmount: number;
  returnRate: number;
  avgProcessingTime: number;
  categories: {
    name: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  reasons: {
    type: string;
    count: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    count: number;
    amount: number;
    rate: number;
  }[];
  qualityIssues: {
    total: number;
    percentage: number;
    bySupplier: {
      supplier: string;
      count: number;
      percentage: number;
    }[];
  };
}

interface SalesReturnAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReturnData[];
}

export default function SalesReturnAnalysisModal({
  isOpen,
  onClose,
  data,
}: SalesReturnAnalysisModalProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  // 计算分析数据
  const analysis: ReturnAnalysis = {
    totalReturns: data.length,
    totalAmount: data.reduce((sum, item) => sum + item.amount, 0),
    returnRate: 3.5, // 这里应该根据总销售量计算
    avgProcessingTime: data.reduce((sum, item) => sum + item.processingTime, 0) / data.length,
    categories: [
      { name: '抗生素', count: 25, amount: 12500, percentage: 35 },
      { name: '解热镇痛', count: 18, amount: 9000, percentage: 25 },
      { name: '维生素', count: 15, amount: 7500, percentage: 20 },
    ],
    reasons: [
      { type: '质量问题', count: 30, percentage: 40 },
      { type: '包装破损', count: 20, percentage: 25 },
      { type: '过期', count: 15, percentage: 20 },
      { type: '其他', count: 10, percentage: 15 },
    ],
    trends: Array.from({ length: 12 }, (_, i) => ({
      date: `2024-${(i + 1).toString().padStart(2, '0')}`,
      count: Math.floor(Math.random() * 20 + 10),
      amount: Math.random() * 10000 + 5000,
      rate: Math.random() * 2 + 2,
    })),
    qualityIssues: {
      total: data.filter(item => item.qualityIssue).length,
      percentage: (data.filter(item => item.qualityIssue).length / data.length) * 100,
      bySupplier: [
        { supplier: '供应商A', count: 12, percentage: 40 },
        { supplier: '供应商B', count: 8, percentage: 27 },
        { supplier: '供应商C', count: 6, percentage: 20 },
      ],
    },
  };

  // 退货趋势图配置
  const trendOption = {
    title: {
      text: '退货趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['退货数量', '退货金额', '退货率'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: analysis.trends.map(t => t.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '数量/金额',
        position: 'left',
      },
      {
        type: 'value',
        name: '退货率(%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '退货数量',
        type: 'bar',
        data: analysis.trends.map(t => t.count),
      },
      {
        name: '退货金额',
        type: 'line',
        data: analysis.trends.map(t => t.amount),
      },
      {
        name: '退货率',
        type: 'line',
        yAxisIndex: 1,
        data: analysis.trends.map(t => t.rate),
      },
    ],
  };

  // 退货原因分布图配置
  const reasonOption = {
    title: {
      text: '退货原因分布',
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
          show: true,
          formatter: '{b}: {d}%',
        },
        data: analysis.reasons.map(reason => ({
          name: reason.type,
          value: reason.count,
        })),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = data.map(item => ({
      '产品名称': item.productName,
      '退货日期': item.returnDate,
      '数量': item.quantity,
      '金额': item.amount,
      '原因': item.reason,
      '类别': item.category,
      '供应商': item.supplier,
      '状态': item.status === 'pending' ? '待处理' :
             item.status === 'approved' ? '已批准' :
             item.status === 'rejected' ? '已拒绝' : '已完成',
      '处理时间(小��)': item.processingTime,
      '质量问题': item.qualityIssue ? '是' : '否',
      '批次号': item.batchNumber || '',
      '客户反馈': item.customerFeedback || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "退货分析");
    XLSX.writeFile(wb, `退货分析报告_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            退货分析
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              导出Excel
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
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总退货数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {analysis.totalReturns}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                退货金额
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{analysis.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ��货率
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {analysis.returnRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均处理时间
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {analysis.avgProcessingTime.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={reasonOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">质量问题分析</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>质量问题占比</span>
                  <span className="text-red-600">{analysis.qualityIssues.percentage.toFixed(1)}%</span>
                </div>
                <div className="space-y-2">
                  {analysis.qualityIssues.bySupplier.map((supplier, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1">{supplier.supplier}</span>
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${supplier.percentage}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm">{supplier.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface PriceAnalysis {
  productId: string;
  productName: string;
  currentPrice: number;
  historicalPrices: {
    date: string;
    price: number;
    marketAverage: number;
  }[];
  priceComparison: {
    supplierName: string;
    price: number;
    difference: number;
  }[];
  priceFactors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  recommendations: {
    type: 'price_negotiation' | 'volume_discount' | 'contract_renewal' | 'supplier_switch';
    description: string;
    potentialSavings: number;
  }[];
}

interface SupplierPriceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  data: PriceAnalysis;
}

export default function SupplierPriceAnalysisModal({
  isOpen,
  onClose,
  supplierName,
  data,
}: SupplierPriceAnalysisModalProps) {
  const [selectedProduct] = useState<PriceAnalysis>(data);

  if (!isOpen) return null;

  // 价格趋势图配置
  const trendOption = {
    title: {
      text: '价格趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['供应商价格', '市场平均价'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: selectedProduct.historicalPrices.map((p) => p.date),
    },
    yAxis: {
      type: 'value',
      name: '价格 (元)',
    },
    series: [
      {
        name: '供应商价格',
        type: 'line',
        data: selectedProduct.historicalPrices.map((p) => p.price),
        smooth: true,
      },
      {
        name: '市场平均价',
        type: 'line',
        data: selectedProduct.historicalPrices.map((p) => p.marketAverage),
        smooth: true,
      },
    ],
  };

  // 价格影响因素图配置
  const factorsOption = {
    title: {
      text: '价格影响因素分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: selectedProduct.priceFactors.map((f) => f.factor),
    },
    series: [
      {
        type: 'bar',
        data: selectedProduct.priceFactors.map((f) => ({
          value: f.impact,
          itemStyle: {
            color: f.impact > 0 ? '#67C23A' : '#F56C6C',
          },
        })),
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = {
      '产品名称': selectedProduct.productName,
      '当前价格': selectedProduct.currentPrice,
      '市场均价': selectedProduct.historicalPrices[selectedProduct.historicalPrices.length - 1].marketAverage,
      '价格差异': (selectedProduct.currentPrice - selectedProduct.historicalPrices[selectedProduct.historicalPrices.length - 1].marketAverage).toFixed(2),
      '潜在节省': selectedProduct.recommendations.reduce((sum, r) => sum + r.potentialSavings, 0),
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "价格分析");
    XLSX.writeFile(wb, `${supplierName}_价格分析_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            价格分析 - {supplierName}
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
          {/* 价格概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                当前价格
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedProduct.currentPrice}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                市场均价
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedProduct.historicalPrices[selectedProduct.historicalPrices.length - 1].marketAverage}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                潜在节省
              </h4>
              <p className="text-2xl font-semibold mt-2 text-green-600">
                ¥{selectedProduct.recommendations.reduce((sum, r) => sum + r.potentialSavings, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={factorsOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 价格对比 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">市场价格对比</h4>
            <div className="space-y-4">
              {selectedProduct.priceComparison.map((comparison, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{comparison.supplierName}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">¥{comparison.price}</span>
                    <span className={`text-sm ${
                      comparison.difference === 0 ? 'text-gray-500' :
                      comparison.difference > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {comparison.difference === 0 ? '-' :
                       comparison.difference > 0 ? `+${comparison.difference}` :
                       comparison.difference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 优化建议 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">优化建议</h4>
            <div className="space-y-4">
              {selectedProduct.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {recommendation.type === 'price_negotiation' ? '价格谈判' :
                       recommendation.type === 'volume_discount' ? '批量折扣' :
                       recommendation.type === 'contract_renewal' ? '合同续签' :
                       '供应商切换'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {recommendation.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      潜在节省
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ¥{recommendation.potentialSavings.toLocaleString()}
                    </div>
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
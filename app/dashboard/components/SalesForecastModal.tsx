'use client';
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface SalesForecast {
  date: string;
  actual: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

interface ProductForecast {
  productId: string;
  productName: string;
  currentSales: number;
  forecastedSales: number;
  growthRate: number;
  confidence: number;
  seasonality: {
    period: string;
    impact: number;
  }[];
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  trends: SalesForecast[];
}

interface SalesForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProductForecast[];
}

export default function SalesForecastModal({
  isOpen,
  onClose,
  data,
}: SalesForecastModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductForecast | null>(null);
  const [forecastPeriod, setForecastPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (data.length > 0) {
      setSelectedProduct(data[0]);
    }
  }, [data]);

  if (!isOpen || !selectedProduct) return null;

  // 修改销售预测趋势图配置
  const trendOption = {
    title: {
      text: '销售预测趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any[]) {
        const date = params[0].axisValue;
        let result = `${date}<br/>`;
        params.forEach((param) => {
          if (param.seriesName === '预测区间') {
            return; // 跳过预测区间的提示
          }
          const value = typeof param.value === 'number' 
            ? param.value.toLocaleString() 
            : param.value;
          result += `${param.marker}${param.seriesName}: ¥${value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['实际销售', '预测销售', '预测区间'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: selectedProduct.trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
      name: '销售额（元）',
    },
    series: [
      {
        name: '实际销售',
        type: 'line',
        data: selectedProduct.trends.map(t => t.actual),
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '预测销售',
        type: 'line',
        data: selectedProduct.trends.map(t => t.forecast),
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#52c41a',
        },
      },
      {
        name: '预测区间',
        type: 'line',
        data: selectedProduct.trends.map(t => [t.lowerBound, t.upperBound]),
        smooth: true,
        lineStyle: {
          opacity: 0,
        },
        areaStyle: {
          color: '#52c41a',
          opacity: 0.1,
        },
      },
    ],
  };

  // 修改季节性影响图配置
  const seasonalityOption = {
    title: {
      text: '季节性影响分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%',
    },
    xAxis: {
      type: 'category',
      data: selectedProduct.seasonality.map(s => s.period),
    },
    yAxis: {
      type: 'value',
      name: '影响程度（%）',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        type: 'bar',
        data: selectedProduct.seasonality.map(s => ({
          value: Number((s.impact * 100).toFixed(1)),
          itemStyle: {
            color: s.impact > 0 ? '#52c41a' : '#f5222d',
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = selectedProduct.trends.map(trend => ({
      '日期': trend.date,
      '实际销售': trend.actual,
      '预测销售': trend.forecast,
      '预测下限': trend.lowerBound,
      '预测上限': trend.upperBound,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "销售预测");
    XLSX.writeFile(wb, `${selectedProduct.productName}_销售预测_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            销售预测分析
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
          {/* 产品选择和时间范围 */}
          <div className="flex justify-between items-center">
            <select
              value={selectedProduct.productId}
              onChange={(e) => setSelectedProduct(
                data.find(p => p.productId === e.target.value) || data[0]
              )}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {data.map(product => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              {[
                { value: 'month', label: '月度预测' },
                { value: 'quarter', label: '季度预测' },
                { value: 'year', label: '年度预测' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setForecastPeriod(period.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    forecastPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* 预测概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                当前销量
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedProduct.currentSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                预测销量
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{selectedProduct.forecastedSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                增长率
              </h4>
              <p className={`text-2xl font-semibold mt-2 ${
                selectedProduct.growthRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedProduct.growthRate > 0 ? '+' : ''}{selectedProduct.growthRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                预测置信度
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {selectedProduct.confidence}%
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-2">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div>
              <ReactECharts option={seasonalityOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">影响因素分析</h4>
              <div className="space-y-4">
                {selectedProduct.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{factor.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {factor.description}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      factor.impact > 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface PriceHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  date: string;
  price: number;
  changeReason?: string;
  priceType: 'regular' | 'promotion' | 'negotiated';
  validFrom: string;
  validTo?: string;
  approver: string;
}

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  productName: string;
  histories: PriceHistory[];
}

const mockHistories: PriceHistory[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: '医药供应商A',
    productId: '1',
    productName: '阿莫西林胶囊',
    date: '2024-03-20',
    price: 35.0,
    changeReason: '市场价格调整',
    priceType: 'regular',
    validFrom: '2024-03-20',
    approver: '张三',
  },
  {
    id: '2',
    supplierId: '1',
    supplierName: '医药供应商A',
    productId: '1',
    productName: '阿莫西林胶囊',
    date: '2024-02-15',
    price: 32.5,
    changeReason: '促销活动',
    priceType: 'promotion',
    validFrom: '2024-02-15',
    validTo: '2024-03-15',
    approver: '李四',
  },
  {
    id: '3',
    supplierId: '1',
    supplierName: '医药供应商A',
    productId: '1',
    productName: '阿莫西林胶囊',
    date: '2024-01-01',
    price: 33.0,
    changeReason: '年度价格协商',
    priceType: 'negotiated',
    validFrom: '2024-01-01',
    approver: '王五',
  },
];

export default function PriceHistoryModal({
  isOpen,
  onClose,
  supplierName,
  productName,
  histories = mockHistories,
}: PriceHistoryModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year' | 'all'>('all');
  const [selectedPriceType, setSelectedPriceType] = useState<'all' | PriceHistory['priceType']>('all');

  if (!isOpen) return null;

  const getFilteredHistories = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    return histories.filter(history => {
      const historyDate = new Date(history.date);
      const matchesPeriod = selectedPeriod === 'all' ||
        (selectedPeriod === '3months' && historyDate >= threeMonthsAgo) ||
        (selectedPeriod === '6months' && historyDate >= sixMonthsAgo) ||
        (selectedPeriod === '1year' && historyDate >= oneYearAgo);
      
      const matchesPriceType = selectedPriceType === 'all' || history.priceType === selectedPriceType;
      
      return matchesPeriod && matchesPriceType;
    });
  };

  const getPriceTypeColor = (type: PriceHistory['priceType']) => {
    switch (type) {
      case 'regular': return 'text-blue-600 bg-blue-100';
      case 'promotion': return 'text-green-600 bg-green-100';
      case 'negotiated': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriceTypeLabel = (type: PriceHistory['priceType']) => {
    switch (type) {
      case 'regular': return '常规价格';
      case 'promotion': return '促销价格';
      case 'negotiated': return '协商价格';
      default: return '未知类型';
    }
  };

  const filteredHistories = getFilteredHistories();
  const sortedHistories = [...filteredHistories].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 图表配置
  const chartOption = {
    title: {
      text: '价格变动趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0].data;
        return `${data[0]}<br/>价���：¥${data[1]}<br/>类型：${getPriceTypeLabel(data[2])}`;
      }
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: '{yyyy}-{MM}-{dd}',
      },
    },
    yAxis: {
      type: 'value',
      name: '价格 (元)',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [{
      name: '价格',
      type: 'line',
      data: sortedHistories.map(h => [h.date, h.price, h.priceType]),
      markPoint: {
        data: [
          { type: 'max', name: '最高价' },
          { type: 'min', name: '最低价' },
        ],
      },
      markLine: {
        data: [
          { type: 'average', name: '平均价' },
        ],
      },
    }],
  };

  // 计算统计数据
  const priceStats = {
    current: sortedHistories[sortedHistories.length - 1]?.price || 0,
    highest: Math.max(...sortedHistories.map(h => h.price)),
    lowest: Math.min(...sortedHistories.map(h => h.price)),
    average: sortedHistories.reduce((sum, h) => sum + h.price, 0) / sortedHistories.length,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            价格历史 - {supplierName} - {productName}
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
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                当前价格
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{priceStats.current.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                最高价格
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{priceStats.highest.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                最低价格
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{priceStats.lowest.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均价格
              </h4>
              <p className="text-2xl font-semibold mt-2">
                ¥{priceStats.average.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部时间' },
                { value: '3months', label: '近3个月' },
                { value: '6months', label: '近6个月' },
                { value: '1year', label: '近1年' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部类型' },
                { value: 'regular', label: '常规价格' },
                { value: 'promotion', label: '促销价格' },
                { value: 'negotiated', label: '协商价格' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedPriceType(type.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedPriceType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 价格趋势图 */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <ReactECharts option={chartOption} style={{ height: '400px' }} />
          </div>

          {/* 价格历史列表 */}
          <div className="space-y-4">
            {sortedHistories.map((history) => (
              <div
                key={history.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">
                      ¥{history.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      生效日期：{history.validFrom}
                      {history.validTo && ` 至 ${history.validTo}`}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriceTypeColor(history.priceType)}`}>
                    {getPriceTypeLabel(history.priceType)}
                  </span>
                </div>
                {history.changeReason && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    调整原因：{history.changeReason}
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  审批人：{history.approver}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
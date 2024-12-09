'use client';
import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import StockAlertModal from '../components/StockAlertModal';
import BatchAlertModal from '../components/BatchAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import AlertTemplateModal from '../components/AlertTemplateModal';
import ReplenishmentModal from '../components/ReplenishmentModal';
import ReplenishmentHistoryModal from '../components/ReplenishmentHistoryModal';
import ReplenishmentPlanModal from '../components/ReplenishmentPlanModal';
import InventoryAnalysisModal from '../components/InventoryAnalysisModal';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'normal' | 'low' | 'overstock';
  lastUpdate: string;
  alertSettings?: any;
}

interface ReplenishmentSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  suggestedAmount: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  historicalData: {
    date: string;
    sales: number;
    stock: number;
    avgDailySales: number;
    lastMonthSales: number;
    stockoutRisk: number;
  }[];
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '阿莫西林胶囊',
    category: '抗生素',
    stock: 85,
    minStock: 100,
    maxStock: 1000,
    status: 'low',
    lastUpdate: '2024-03-20 10:30',
  },
  // ... 其他模拟数据
];

const mockAnalysisData = {
  turnoverRate: 4.5,
  stockoutRate: 2.3,
  overstockRate: 5.6,
  averageInventoryDays: 45,
  inventoryValue: 1250000,
  trends: [
    { date: '2024-01', stockLevel: 1200, inbound: 500, outbound: 450 },
    { date: '2024-02', stockLevel: 1250, inbound: 600, outbound: 550 },
    { date: '2024-03', stockLevel: 1300, inbound: 550, outbound: 500 },
  ],
  categories: [
    { name: '抗生素', value: 450000, percentage: 36 },
    { name: '解热镇痛', value: 300000, percentage: 24 },
    { name: '维生素', value: 250000, percentage: 20 },
    { name: '心血管', value: 150000, percentage: 12 },
    { name: '消化系统', value: 100000, percentage: 8 },
  ],
  alerts: [
    { type: 'stockout' as const, count: 12, trend: 'down' as const, percentage: 15 },
    { type: 'overstock' as const, count: 8, trend: 'up' as const, percentage: 10 },
    { type: 'expiring' as const, count: 5, trend: 'stable' as const, percentage: 6 },
  ],
};

const mockReplenishmentSuggestions: ReplenishmentSuggestion[] = [
  {
    productId: '1',
    productName: '阿莫西林胶囊',
    currentStock: 85,
    suggestedAmount: 200,
    reason: '库存低于安全库存',
    priority: 'high',
    historicalData: [
      {
        date: '2024-01',
        sales: 120,
        stock: 150,
        avgDailySales: 4,
        lastMonthSales: 120,
        stockoutRisk: 0.8
      },
      {
        date: '2024-02',
        sales: 100,
        stock: 130,
        avgDailySales: 3.5,
        lastMonthSales: 100,
        stockoutRisk: 0.6
      },
      {
        date: '2024-03',
        sales: 90,
        stock: 85,
        avgDailySales: 3,
        lastMonthSales: 90,
        stockoutRisk: 0.9
      },
    ],
  },
  // 可以添加更多建议...
];

export default function InventoryManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showBatchAlertModal, setShowBatchAlertModal] = useState(false);
  const [showAlertHistoryModal, setShowAlertHistoryModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showReplenishmentModal, setShowReplenishmentModal] = useState(false);
  const [showReplenishmentHistoryModal, setShowReplenishmentHistoryModal] = useState(false);
  const [showReplenishmentPlanModal, setShowReplenishmentPlanModal] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);
  const [selectedProductForPlan, setSelectedProductForPlan] = useState<Product | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // 使用 useEffect 来加载初始数据
  useEffect(() => {
    // 模拟API调用
    const loadData = async () => {
      try {
        // 在实际应用中，这里会是一个API调用
        setProducts(mockProducts);
      } catch (error) {
        console.error('Failed to load inventory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const inventoryStatusOptions = {
    title: {
      text: '库存状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '库存状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '充足' },
          { value: 735, name: '正常' },
          { value: 580, name: '低' },
          { value: 484, name: '不足' },
          { value: 300, name: '积压' }
        ]
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">库存管理</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAlertModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            库存预警
          </button>
          <button 
            onClick={() => setShowReplenishmentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            补货建议
          </button>
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            库存分析
          </button>
        </div>
      </div>

      {/* 库存概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">总库存金额</h3>
          <p className="text-2xl font-semibold mt-2">¥1,234,567</p>
          <span className="text-blue-600 text-sm">共计商品 3,456 件</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">库存预警</h3>
          <p className="text-2xl font-semibold mt-2 text-yellow-600">28</p>
          <span className="text-yellow-600 text-sm">需要及时处理</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">积压库存</h3>
          <p className="text-2xl font-semibold mt-2 text-red-600">12</p>
          <span className="text-red-600 text-sm">建议清理处理</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">周转天数</h3>
          <p className="text-2xl font-semibold mt-2">45</p>
          <span className="text-green-600 text-sm">良好</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 库存状态分布图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <ReactECharts option={inventoryStatusOptions} style={{ height: '400px' }} />
        </div>

        {/* 库存预警列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">库存预警清单</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3">商品名称</th>
                <th className="text-right">当前库存</th>
                <th className="text-right">安全库存</th>
                <th className="text-right">状态</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-3">商品 {index + 1}</td>
                  <td className="text-right">{Math.floor(Math.random() * 100)}</td>
                  <td className="text-right">100</td>
                  <td className="text-right">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      库存不足
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StockAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSave={(settings) => {
          console.log('Alert settings:', settings);
          setShowAlertModal(false);
        }}
        initialData={undefined}
        productName="全部商品"
        productId="all"
      />

      <ReplenishmentModal
        isOpen={showReplenishmentModal}
        onClose={() => setShowReplenishmentModal(false)}
        onConfirm={(suggestions) => {
          console.log('Replenishment suggestions:', suggestions);
          setShowReplenishmentModal(false);
        }}
        suggestions={[
          {
            productId: '1',
            productName: '阿莫西林胶囊',
            currentStock: 85,
            suggestedAmount: 200,
            reason: '库存低于安全库存',
            priority: 'high',
            historicalData: [
              {
                date: '2024-01',
                sales: 120,
                stock: 150,
                avgDailySales: 4,
                lastMonthSales: 120,
                stockoutRisk: 0.8
              },
              {
                date: '2024-02',
                sales: 100,
                stock: 130,
                avgDailySales: 3.5,
                lastMonthSales: 100,
                stockoutRisk: 0.6
              },
              {
                date: '2024-03',
                sales: 90,
                stock: 85,
                avgDailySales: 3,
                lastMonthSales: 90,
                stockoutRisk: 0.9
              },
            ],
          },
        ]}
      />

      <InventoryAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        data={mockAnalysisData}
      />
    </div>
  );
} 
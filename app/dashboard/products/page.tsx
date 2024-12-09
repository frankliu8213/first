'use client';
import { useState } from 'react';
import ProductFormModal from '../components/ProductFormModal';
import ImportExportModal from '../components/ImportExportModal';
import Image from 'next/image';
import StockAlertModal from '../components/StockAlertModal';
import BatchAlertModal from '../components/BatchAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import AlertTemplateModal from '../components/AlertTemplateModal';
import ReplenishmentModal from '../components/ReplenishmentModal';
import ReplenishmentHistoryModal from '../components/ReplenishmentHistoryModal';
import ReplenishmentPlanModal from '../components/ReplenishmentPlanModal';
import StockAlertSettingsModal from '../components/StockAlertSettingsModal';

interface AlertSettings {
  minStock: number;
  maxStock: number;
  isEnabled: boolean;
  notifyMethods: {
    email: boolean;
    system: boolean;
    sms: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
  autoReplenish: boolean;
  replenishAmount: number;
  contacts: string[];
  productId?: string;
  productName?: string;
}

interface BatchAlertSettings extends AlertSettings {
  categories: string[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  updateTime: string;
  image?: string;
  alertSettings?: AlertSettings;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '阿莫西林胶囊',
    category: '抗生素',
    price: 35.8,
    stock: 1200,
    status: 'active',
    updateTime: '2024-03-20 10:30',
  },
  {
    id: '2',
    name: '布洛芬片',
    category: '解热镇痛',
    price: 25.5,
    stock: 800,
    status: 'active',
    updateTime: '2024-03-19 15:45',
  },
  // 添加更多模拟数据...
];

const categories = ['全部', '抗生素', '解热镇痛', '维生素', '心血管', '消化系统'];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBatchAlertModal, setShowBatchAlertModal] = useState(false);
  const [showAlertHistoryModal, setShowAlertHistoryModal] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showReplenishmentModal, setShowReplenishmentModal] = useState(false);
  const [showReplenishmentHistoryModal, setShowReplenishmentHistoryModal] = useState(false);
  const [selectedProductForReplenishmentHistory, setSelectedProductForReplenishmentHistory] = useState<Product | null>(null);
  const [showReplenishmentPlanModal, setShowReplenishmentPlanModal] = useState(false);
  const [selectedProductForPlan, setSelectedProductForPlan] = useState<Product | null>(null);
  const [showAlertSettingsModal, setShowAlertSettingsModal] = useState(false);
  const [selectedProductForSettings, setSelectedProductForSettings] = useState<Product | null>(null);

  const handleAddProduct = (formData: any) => {
    const newProduct = {
      id: (products.length + 1).toString(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      status: 'active' as const,
      updateTime: new Date().toLocaleString(),
    };

    setProducts([...products, newProduct]);
    setShowAddModal(false);
  };

  const handleImport = (data: any[]) => {
    const newProducts = data.map((item, index) => ({
      id: (products.length + index + 1).toString(),
      name: item['产品名称'],
      category: item['类别'],
      price: parseFloat(item['价格']),
      stock: parseInt(item['库存数量']),
      status: 'active' as const,
      updateTime: new Date().toLocaleString(),
    }));

    setProducts([...products, ...newProducts]);
  };

  const templateFields = ['产品名称', '类别', '价格', '库存数量', '生产厂家', '规格', '产品描述'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAlertSettings = (product: Product) => {
    setSelectedProduct(product);
    setShowAlertModal(true);
  };

  const handleSaveAlertSettings = async (settings: AlertSettings) => {
    if (selectedProductForSettings) {
      try {
        const updatedProducts = products.map(product => {
          if (product.id === selectedProductForSettings.id) {
            return {
              ...product,
              alertSettings: {
                ...settings,
                productId: product.id,
                productName: product.name,
              }
            };
          }
          return product;
        });

        setProducts(updatedProducts);
        setShowAlertSettingsModal(false);
        setSelectedProductForSettings(null);
      } catch (error) {
        console.error('Failed to save alert settings:', error);
      }
    }
  };

  const handleBatchAlertSettings = (settings: BatchAlertSettings) => {
    const updatedProducts = products.map(product => {
      if (settings.categories.includes(product.category)) {
        return {
          ...product,
          alertSettings: {
            minStock: settings.minStock,
            maxStock: settings.maxStock,
            isEnabled: settings.isEnabled,
            notifyMethods: settings.notifyMethods,
            frequency: settings.frequency,
            autoReplenish: settings.autoReplenish,
            replenishAmount: settings.replenishAmount,
            contacts: settings.contacts,
            productId: product.id,
            productName: product.name,
          }
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setShowBatchAlertModal(false);
  };

  const handleViewAlertHistory = (product: Product) => {
    setSelectedProductForHistory(product);
    setShowAlertHistoryModal(true);
  };

  const handleUpdateAlertStatus = (id: string, status: string) => {
    // 在实际应用中，这里会调用API更新状态
    console.log('Update alert status:', id, status);
  };

  const handleSaveTemplate = (template: any) => {
    // 在实际应用中，这里会调用API保存模板
    console.log('Save template:', template);
    setShowTemplateModal(false);
  };

  const handleApplyTemplate = (templateId: string, categories: string[]) => {
    // 在实际应用中，这里会调用API应用模板设置
    console.log('Apply template:', templateId, 'to categories:', categories);
    setShowTemplateModal(false);
  };

  const handleConfirmReplenishment = (suggestions: any[]) => {
    // 在实际应用中，这里会调用API处理补货订单
    console.log('Confirm replenishment:', suggestions);
    setShowReplenishmentModal(false);
  };

  const handleViewReplenishmentHistory = (product: Product) => {
    setSelectedProductForReplenishmentHistory(product);
    setShowReplenishmentHistoryModal(true);
  };

  const handleUpdateReplenishmentStatus = (id: string, status: string) => {
    // 在实际应用中，这里会调用API更新补货状态
    console.log('Update replenishment status:', id, status);
  };

  const handleSavePlan = (plan: any) => {
    // 在实际应用中，这里会调用API保存补货计划
    console.log('Save replenishment plan:', plan);
    setShowReplenishmentPlanModal(false);
  };

  const handleUpdatePlanStatus = (id: string, status: string) => {
    // 在实际应用中，这里会调用API更新计划状态
    console.log('Update plan status:', id, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">产品管理</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            导入产品
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            导出产品
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加产品
          </button>
          <button
            onClick={() => setShowBatchAlertModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            批量预警设置
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            预警规则模板
          </button>
          <button
            onClick={() => setShowReplenishmentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            补货建议
          </button>
        </div>
      </div>

      {/* 选栏 */}
      <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索产品..."
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 产品列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                产品图片
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                产品名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                类别
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                价格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                库存
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                更新时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-12 h-12">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {product.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    ¥{product.price.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${
                    product.stock < 100 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {product.stock}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status === 'active' ? '在售' : '下架'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {product.updateTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedProductForSettings(product);
                      setShowAlertSettingsModal(true);
                    }}
                    className="text-yellow-600 hover:text-yellow-900 mr-4"
                  >
                    预警设置
                  </button>
                  <button
                    onClick={() => handleViewAlertHistory(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    预警历史
                  </button>
                  <button
                    onClick={() => handleViewReplenishmentHistory(product)}
                    className="text-purple-600 hover:text-purple-900 mr-4"
                  >
                    补货历史
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProductForPlan(product);
                      setShowReplenishmentPlanModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    补货计划
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    编辑
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    下架
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          显示 1 到 10 条，共 {products.length} 条记录
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-md">上一页</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
          <button className="px-3 py-1 border rounded-md">2</button>
          <button className="px-3 py-1 border rounded-md">下一页</button>
        </div>
      </div>

      {/* 态框 */}
      <ProductFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
      />
      
      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        mode="import"
        templateFields={templateFields}
      />
      
      <ImportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onImport={() => {}}
        mode="export"
        data={products.map(p => ({
          '产品名称': p.name,
          '类别': p.category,
          '价格': p.price,
          '库存数量': p.stock,
          '状态': p.status === 'active' ? '在售' : '下架',
          '更新时间': p.updateTime,
        }))}
      />
      
      {selectedProduct && (
        <StockAlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveAlertSettings}
          initialData={selectedProduct.alertSettings}
          productName={selectedProduct.name}
          productId={selectedProduct.id}
        />
      )}

      <BatchAlertModal
        isOpen={showBatchAlertModal}
        onClose={() => setShowBatchAlertModal(false)}
        onSave={handleBatchAlertSettings}
        categories={categories.filter(c => c !== '全部')}
      />

      {selectedProductForHistory && (
        <AlertHistoryModal
          isOpen={showAlertHistoryModal}
          onClose={() => {
            setShowAlertHistoryModal(false);
            setSelectedProductForHistory(null);
          }}
          productName={selectedProductForHistory.name}
          histories={[]} // 这里应该从API获取历史记录
          onUpdateStatus={handleUpdateAlertStatus}
        />
      )}

      <AlertTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSave={handleSaveTemplate}
        onApply={handleApplyTemplate}
        categories={categories.filter(c => c !== '全部')}
        templates={[]} // 这里应该从API获取模板列表
      />

      <ReplenishmentModal
        isOpen={showReplenishmentModal}
        onClose={() => setShowReplenishmentModal(false)}
        onConfirm={handleConfirmReplenishment}
        suggestions={[]} // 这里应该从API获取补货建议
      />

      {selectedProductForReplenishmentHistory && (
        <ReplenishmentHistoryModal
          isOpen={showReplenishmentHistoryModal}
          onClose={() => {
            setShowReplenishmentHistoryModal(false);
            setSelectedProductForReplenishmentHistory(null);
          }}
          productName={selectedProductForReplenishmentHistory.name}
          histories={[]} // 这里应该从API获取历史记录
          onUpdateStatus={handleUpdateReplenishmentStatus}
        />
      )}

      {selectedProductForPlan && (
        <ReplenishmentPlanModal
          isOpen={showReplenishmentPlanModal}
          onClose={() => {
            setShowReplenishmentPlanModal(false);
            setSelectedProductForPlan(null);
          }}
          productName={selectedProductForPlan.name}
          plans={[]} // 这里应该从API获取计划列表
          onSave={handleSavePlan}
          onUpdateStatus={handleUpdatePlanStatus}
        />
      )}

      {selectedProductForSettings && (
        <StockAlertSettingsModal
          isOpen={showAlertSettingsModal}
          onClose={() => {
            setShowAlertSettingsModal(false);
            setSelectedProductForSettings(null);
          }}
          onSave={handleSaveAlertSettings}
          productName={selectedProductForSettings.name}
          currentStock={selectedProductForSettings.stock}
          initialData={selectedProductForSettings.alertSettings || {
            minStock: Math.floor(selectedProductForSettings.stock * 0.2),
            maxStock: selectedProductForSettings.stock * 2,
            isEnabled: true,
            notifyMethods: {
              email: true,
              system: true,
              sms: false,
            },
            frequency: 'realtime' as const,
            autoReplenish: false,
            replenishAmount: selectedProductForSettings.stock,
            contacts: [],
          }}
        />
      )}
    </div>
  );
} 
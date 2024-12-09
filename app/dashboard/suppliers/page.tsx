'use client';
import { useState } from 'react';
import SupplierFormModal from '../components/SupplierFormModal';
import SupplierEvaluationModal from '../components/SupplierEvaluationModal';
import SupplierEvaluationHistoryModal from '../components/SupplierEvaluationHistoryModal';
import EvaluationAnalysisModal from '../components/EvaluationAnalysisModal';
import EvaluationBatchExportModal from '../components/EvaluationBatchExportModal';
import SupplierOrderHistoryModal from '../components/SupplierOrderHistoryModal';
import PriceHistoryModal from '../components/PriceHistoryModal';
import SupplierContractModal from '../components/SupplierContractModal';
import SupplierQualificationModal from '../components/SupplierQualificationModal';
import SupplierPerformanceModal from '../components/SupplierPerformanceModal';
import SupplierRankingModal from '../components/SupplierRankingModal';
import SupplierAnalysisModal from '../components/SupplierAnalysisModal';
import SupplierPriceAnalysisModal from '../components/SupplierPriceAnalysisModal';
import SupplierOrderManagementModal from '../components/SupplierOrderManagementModal';
import SupplierQualityManagementModal from '../components/SupplierQualityManagementModal';
import SupplierRiskAssessmentModal from '../components/SupplierRiskAssessmentModal';
import SupplierCertificateModal from '../components/SupplierCertificateModal';
import SupplierPerformanceReportModal from '../components/SupplierPerformanceReportModal';

interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  category: string[];
  status: 'active' | 'inactive';
  rating: number;
  lastOrderDate?: string;
  totalOrders: number;
  paymentTerms: string;
  remarks?: string;
}

interface EvaluationStats {
  totalEvaluations: number;
  averageScore: number;
  lastEvaluation: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface PerformanceData {
  period: string;
  metrics: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
    defectRate: number;
    onTimeDeliveryRate: number;
    returnRate: number;
    responseTime: number;
    costSavings: number;
  };
  kpis: {
    target: string;
    actual: string;
    status: 'exceeded' | 'met' | 'below';
  }[];
}

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
    trend: 'up' | 'stable' | 'down';
  }[];
  riskAssessment: {
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: '医药供应商A',
    code: 'SUP001',
    contact: '张经理',
    phone: '13800138000',
    email: 'supplier_a@example.com',
    address: '上海市浦东新区张江高科技园区',
    category: ['抗生素', '解热镇痛'],
    status: 'active',
    rating: 4.5,
    lastOrderDate: '2024-03-20',
    totalOrders: 156,
    paymentTerms: '月结30天',
    remarks: '长期合作伙伴，供货稳定',
  },
  {
    id: '2',
    name: '医药供应商B',
    code: 'SUP002',
    contact: '李经理',
    phone: '13900139000',
    email: 'supplier_b@example.com',
    address: '北京市海淀区中关村科技园',
    category: ['心血管', '消化系统'],
    status: 'active',
    rating: 4.0,
    lastOrderDate: '2024-03-18',
    totalOrders: 89,
    paymentTerms: '预付款',
    remarks: '新合作供应商，价格优惠',
  },
];

const categories = ['抗生素', '解热镇痛', '维生素', '心血管', '消化系统'];

const mockPerformanceData: PerformanceData[] = [
  {
    period: '2024-Q1',
    metrics: {
      qualityScore: 4.5,
      deliveryScore: 4.2,
      priceScore: 4.0,
      serviceScore: 4.3,
      cooperationScore: 4.4,
      defectRate: 0.5,
      onTimeDeliveryRate: 98,
      returnRate: 0.8,
      responseTime: 2,
      costSavings: 5.2,
    },
    kpis: [
      { target: '产品合格率 > 99%', actual: '99.5%', status: 'exceeded' },
      { target: '准时交付率 > 95%', actual: '98%', status: 'met' },
      { target: '退货率 < 1%', actual: '0.8%', status: 'met' },
    ],
  },
];

const mockAnalysisData: SupplierAnalysis = {
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
    { metric: '产品合格率', value: 99.5, benchmark: 99.0, trend: 'up' as const },
    { metric: '准时交付率', value: 98.0, benchmark: 95.0, trend: 'stable' as const },
    { metric: '文档完整性', value: 97.5, benchmark: 95.0, trend: 'up' as const },
    { metric: '客户满意度', value: 4.5, benchmark: 4.0, trend: 'up' as const },
  ],
  riskAssessment: [
    { factor: '供应稳定性', level: 'low' as const, description: '供应链稳定，无重大风险' },
    { factor: '质量控制', level: 'low' as const, description: '质量管理体系完善' },
    { factor: '价格波动', level: 'medium' as const, description: '原材料价格存在波动风险' },
    { factor: '合规性', level: 'low' as const, description: '各项资质齐全，定期��新' },
  ],
};

const mockPriceAnalysisData = {
  productId: '1',
  productName: '阿莫西林胶囊',
  currentPrice: 35.8,
  historicalPrices: [
    { date: '2024-01', price: 36.5, marketAverage: 37.2 },
    { date: '2024-02', price: 35.8, marketAverage: 36.8 },
    { date: '2024-03', price: 35.8, marketAverage: 36.5 },
  ],
  priceComparison: [
    { supplierName: '医药供应商A', price: 35.8, difference: 0 },
    { supplierName: '医药供应商B', price: 36.5, difference: 0.7 },
    { supplierName: '医药供应商C', price: 37.2, difference: 1.4 },
  ],
  priceFactors: [
    { factor: '原材料成本', impact: -0.8, description: '原材料价格上涨' },
    { factor: '运输成本', impact: -0.3, description: '燃油价格上涨' },
    { factor: '批量采购', impact: 0.5, description: '采购量增加带来的优惠' },
    { factor: '市场竞争', impact: 0.3, description: '市场竞争加剧' },
  ],
  recommendations: [
    {
      type: 'price_negotiation' as const,
      description: '基于市场价格分析，建议与供应商协商降价',
      potentialSavings: 15000,
    },
    {
      type: 'volume_discount' as const,
      description: '增加采购量以获取更多折扣',
      potentialSavings: 25000,
    },
  ],
};

const mockOrders = [
  {
    id: '1',
    orderNumber: 'PO20240320001',
    orderDate: '2024-03-20',
    expectedDeliveryDate: '2024-03-25',
    status: 'processing' as const,
    items: [
      {
        productId: '1',
        productName: '阿莫西林胶囊',
        quantity: 1000,
        price: 35,
        subtotal: 35000,
      },
      {
        productId: '2',
        productName: '布洛芬片',
        quantity: 600,
        price: 25,
        subtotal: 15000,
      },
    ],
    totalAmount: 50000,
    paymentStatus: 'partial' as const,
    paymentMethod: '银行转账',
    shippingMethod: '陆运',
    remarks: '常规采购订单',
  },
];

const mockQualityRecords = [
  {
    id: '1',
    inspectionDate: '2024-03-20',
    batchNumber: 'B20240320001',
    productName: '阿莫西林胶囊',
    sampleSize: 100,
    defectCount: 2,
    defectRate: 2,
    defectTypes: [
      { type: '包装破损', count: 1, severity: 'minor' as const },
      { type: '含量不足', count: 1, severity: 'major' as const },
    ],
    inspectionResult: 'pass' as const,
    inspector: '张三',
    remarks: '整体质量良好，个别包装需改进',
    correctiveActions: [
      '加强包装环节质量控制',
      '复查生产工艺参数',
    ],
  },
];

const mockQualityMetrics = {
  totalInspections: 156,
  passRate: 98.2,
  averageDefectRate: 1.8,
  criticalDefects: 0,
  majorDefects: 12,
  minorDefects: 28,
  trends: [
    { date: '2024-01', defectRate: 2.1, passRate: 97.9 },
    { date: '2024-02', defectRate: 1.9, passRate: 98.1 },
    { date: '2024-03', defectRate: 1.8, passRate: 98.2 },
  ],
};

const mockRiskAssessmentData = {
  overallRisk: 3.2,
  riskFactors: [
    {
      id: '1',
      name: '供应链中断',
      category: '供应链' as const,
      level: 'high' as const,
      score: 4.2,
      impact: 4,
      probability: 3,
      description: '主要原材料供应商集中度高，存在供应中断风险',
      mitigationPlan: '开发备选供应商，建立安全库存',
      status: 'active' as const,
      lastAssessment: '2024-03-01',
      nextAssessment: '2024-04-01',
      trends: [
        { date: '2024-01', score: 4.5 },
        { date: '2024-02', score: 4.3 },
        { date: '2024-03', score: 4.2 },
      ],
    },
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
      priority: 'high' as const,
      action: '开发备选供应商',
      impact: '降低供应链中断风险',
      deadline: '2024-06-30',
      status: 'in_progress' as const,
    },
    {
      priority: 'medium' as const,
      action: '优化库存管理',
      impact: '降低库存成本',
      deadline: '2024-05-31',
      status: 'pending' as const,
    },
  ],
};

const mockCertificates = [
  {
    id: '1',
    name: '药品经营许可证',
    type: '药品经营许可证' as const,
    number: 'GSP20240001',
    issueDate: '2024-01-01',
    expiryDate: '2025-01-01',
    status: 'valid' as const,
    issuingAuthority: '国家药品监督管理局',
    attachments: [],
    remarks: '年度审核已通过',
  },
  {
    id: '2',
    name: 'GSP认证证书',
    type: 'GSP认证' as const,
    number: 'GSP20240002',
    issueDate: '2024-01-01',
    expiryDate: '2025-01-01',
    status: 'valid' as const,
    issuingAuthority: '国家药品监督管理局',
    attachments: [],
  },
];

const mockPerformanceReport = {
  supplierId: '1',
  supplierName: '医药供应商A',
  reportPeriod: '2024-Q1',
  overallScore: 4.2,
  metrics: {
    qualityMetrics: {
      defectRate: 0.5,
      returnRate: 0.8,
      qualityScore: 4.5,
      inspectionPassRate: 99.5,
      trends: [
        { date: '2024-01', value: 4.3 },
        { date: '2024-02', value: 4.4 },
        { date: '2024-03', value: 4.5 },
      ],
    },
    deliveryMetrics: {
      onTimeDeliveryRate: 98,
      leadTime: 3,
      deliveryScore: 4.2,
      orderFulfillmentRate: 99,
      trends: [
        { date: '2024-01', value: 4.0 },
        { date: '2024-02', value: 4.1 },
        { date: '2024-03', value: 4.2 },
      ],
    },
    costMetrics: {
      costSavings: 5.2,
      priceCompetitiveness: 4.0,
      costScore: 4.0,
      paymentCompliance: 100,
      trends: [
        { date: '2024-01', value: 3.8 },
        { date: '2024-02', value: 3.9 },
        { date: '2024-03', value: 4.0 },
      ],
    },
    serviceMetrics: {
      responseTime: 2,
      communicationScore: 4.3,
      serviceScore: 4.3,
      problemResolutionRate: 95,
      trends: [
        { date: '2024-01', value: 4.1 },
        { date: '2024-02', value: 4.2 },
        { date: '2024-03', value: 4.3 },
      ],
    },
  },
  comparisonData: [
    {
      category: '质量',
      supplierScore: 4.5,
      industryAverage: 4.0,
      bestInClass: 4.8,
    },
    {
      category: '交付',
      supplierScore: 4.2,
      industryAverage: 3.8,
      bestInClass: 4.5,
    },
    {
      category: '成本',
      supplierScore: 4.0,
      industryAverage: 3.5,
      bestInClass: 4.3,
    },
    {
      category: '服务',
      supplierScore: 4.3,
      industryAverage: 3.9,
      bestInClass: 4.6,
    },
  ],
  recommendations: [
    {
      category: '质量管理',
      content: '继续保持当前的质量管理水平，可考虑进一步优化检验流程',
      priority: 'low' as const,
      expectedImpact: '提高产品合格率0.2%',
    },
    {
      category: '交付管理',
      content: '建议优化配送路线，缩短配送时间',
      priority: 'medium' as const,
      expectedImpact: '减少配送时间10%',
    },
    {
      category: '成本控制',
      content: '建议通过批量采购获取更多价格优惠',
      priority: 'high' as const,
      expectedImpact: '降低采购成本5%',
    },
  ],
  historicalScores: [
    { date: '2023-Q2', score: 4.0 },
    { date: '2023-Q3', score: 4.1 },
    { date: '2023-Q4', score: 4.1 },
    { date: '2024-Q1', score: 4.2 },
  ],
};

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedSupplierForEvaluation, setSelectedSupplierForEvaluation] = useState<Supplier | null>(null);
  const [showEvaluationHistoryModal, setShowEvaluationHistoryModal] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState<Supplier | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedSupplierForAnalysis, setSelectedSupplierForAnalysis] = useState<Supplier | null>(null);
  const [showBatchExportModal, setShowBatchExportModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedSupplierForOrderHistory, setSelectedSupplierForOrderHistory] = useState<Supplier | null>(null);
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [selectedSupplierForPriceHistory, setSelectedSupplierForPriceHistory] = useState<Supplier | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedSupplierForContract, setSelectedSupplierForContract] = useState<Supplier | null>(null);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [selectedSupplierForQualification, setSelectedSupplierForQualification] = useState<Supplier | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedSupplierForPerformance, setSelectedSupplierForPerformance] = useState<Supplier | null>(null);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showAnalysisReportModal, setShowAnalysisReportModal] = useState(false);
  const [selectedSupplierForAnalysisReport, setSelectedSupplierForAnalysisReport] = useState<Supplier | null>(null);
  const [showPriceAnalysisModal, setShowPriceAnalysisModal] = useState(false);
  const [selectedSupplierForPriceAnalysis, setSelectedSupplierForPriceAnalysis] = useState<Supplier | null>(null);
  const [showOrderManagementModal, setShowOrderManagementModal] = useState(false);
  const [selectedSupplierForOrderManagement, setSelectedSupplierForOrderManagement] = useState<Supplier | null>(null);
  const [showQualityManagementModal, setShowQualityManagementModal] = useState(false);
  const [selectedSupplierForQualityManagement, setSelectedSupplierForQualityManagement] = useState<Supplier | null>(null);
  const [showRiskAssessmentModal, setShowRiskAssessmentModal] = useState(false);
  const [selectedSupplierForRiskAssessment, setSelectedSupplierForRiskAssessment] = useState<Supplier | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedSupplierForCertificate, setSelectedSupplierForCertificate] = useState<Supplier | null>(null);
  const [showPerformanceReportModal, setShowPerformanceReportModal] = useState(false);
  const [selectedSupplierForPerformanceReport, setSelectedSupplierForPerformanceReport] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSaveSupplier = (supplierData: Partial<Supplier>) => {
    if (editingSupplier) {
      // 更新现有供应商
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id ? { ...s, ...supplierData } : s
      ));
      setEditingSupplier(null);
    } else {
      // 添加新供应商
      const newSupplier = {
        ...supplierData,
        id: (suppliers.length + 1).toString(),
        status: 'active',
        totalOrders: 0,
      } as Supplier;
      setSuppliers([...suppliers, newSupplier]);
    }
    setShowAddModal(false);
  };

  const handleStatusChange = (supplierId: string, newStatus: 'active' | 'inactive') => {
    setSuppliers(suppliers.map(s =>
      s.id === supplierId ? { ...s, status: newStatus } : s
    ));
  };

  const handleSaveEvaluation = (evaluation: any) => {
    // 在实际应用中，这会调用API保存评估报告
    console.log('Save evaluation:', evaluation);
    setShowEvaluationModal(false);
    setSelectedSupplierForEvaluation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-blue-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEvaluationStats = (supplier: Supplier): EvaluationStats => {
    // 在实际应用中，这些数据应该从API获取
    return {
      totalEvaluations: 12,
      averageScore: 4.2,
      lastEvaluation: '2024-03-20',
      trend: 'up',
      trendValue: 0.3,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">供应商管理</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加供应商
          </button>
          <button
            onClick={() => setShowBatchExportModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            批量出评估
          </button>
          <button
            onClick={() => setShowRankingModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            评分排名
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            全部
          </button>
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
            placeholder="搜索供应商..."
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden"
          >
            {/* 供应商基本信息 */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{supplier.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    编号：{supplier.code}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  supplier.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supplier.status === 'active' ? '活跃' : '停用'}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">联系人：</span>
                  {supplier.contact}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">电话：</span>
                  {supplier.phone}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">邮箱：</span>
                  {supplier.email}
                </p>
              </div>

              {/* 操作按钮组 */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {/* 第一行：主要操作 */}
                <button
                  onClick={() => {
                    setSelectedSupplierForOrderManagement(supplier);
                    setShowOrderManagementModal(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  订单管理
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForOrderHistory(supplier);
                    setShowOrderHistoryModal(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  订单历史
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForPriceHistory(supplier);
                    setShowPriceHistoryModal(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  价格历史
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForPriceAnalysis(supplier);
                    setShowPriceAnalysisModal(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  价格分析
                </button>

                {/* 第二行：管理操作 */}
                <button
                  onClick={() => {
                    setSelectedSupplierForContract(supplier);
                    setShowContractModal(true);
                  }}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  合同管理
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForQualification(supplier);
                    setShowQualificationModal(true);
                  }}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  资质管理
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForQualityManagement(supplier);
                    setShowQualityManagementModal(true);
                  }}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  质量管理
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForRiskAssessment(supplier);
                    setShowRiskAssessmentModal(true);
                  }}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  风险评估
                </button>

                {/* 第三行：分析操作 */}
                <button
                  onClick={() => {
                    setSelectedSupplierForPerformance(supplier);
                    setShowPerformanceModal(true);
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                >
                  绩效分析
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForEvaluation(supplier);
                    setShowEvaluationModal(true);
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                >
                  供应商评估
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForHistory(supplier);
                    setShowEvaluationHistoryModal(true);
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                >
                  评估历史
                </button>
                <button
                  onClick={() => {
                    setSelectedSupplierForAnalysisReport(supplier);
                    setShowAnalysisReportModal(true);
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                >
                  分析报告
                </button>

                {/* 第四行：状态操作 */}
                <button
                  onClick={() => handleStatusChange(
                    supplier.id,
                    supplier.status === 'active' ? 'inactive' : 'active'
                  )}
                  className={`px-3 py-1 text-sm rounded-md col-span-4 ${
                    supplier.status === 'active'
                      ? 'text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50'
                      : 'text-green-600 hover:text-green-700 border border-green-200 hover:bg-green-50'
                  }`}
                >
                  {supplier.status === 'active' ? '停用供应商' : '启用供应商'}
                </button>

                {/* 添加资质证书管理按钮 */}
                <button
                  onClick={() => {
                    setSelectedSupplierForCertificate(supplier);
                    setShowCertificateModal(true);
                  }}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  资质证书
                </button>

                {/* 在操作按钮组中添加绩效报告按钮 */}
                <button
                  onClick={() => {
                    setSelectedSupplierForPerformanceReport(supplier);
                    setShowPerformanceReportModal(true);
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-md hover:bg-green-50"
                >
                  绩效报告
                </button>
              </div>
            </div>

            {/* 评估统计信息 */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    评估次数
                  </span>
                  <p className="text-lg font-semibold">
                    {getEvaluationStats(supplier).totalEvaluations}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    平均评分
                  </span>
                  <div className="flex items-center">
                    <p className={`text-lg font-semibold ${
                      getScoreColor(getEvaluationStats(supplier).averageScore)
                    }`}>
                      {getEvaluationStats(supplier).averageScore.toFixed(1)}
                    </p>
                    {getEvaluationStats(supplier).trend === 'up' && (
                      <span className="ml-2 text-green-600">↑{getEvaluationStats(supplier).trendValue}</span>
                    )}
                    {getEvaluationStats(supplier).trend === 'down' && (
                      <span className="ml-2 text-red-600">↓{getEvaluationStats(supplier).trendValue}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SupplierFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingSupplier(null);
        }}
        onSave={handleSaveSupplier}
        initialData={editingSupplier}
        categories={categories}
      />

      {selectedSupplierForEvaluation && (
        <SupplierEvaluationModal
          isOpen={showEvaluationModal}
          onClose={() => {
            setShowEvaluationModal(false);
            setSelectedSupplierForEvaluation(null);
          }}
          onSave={handleSaveEvaluation}
          supplierName={selectedSupplierForEvaluation.name}
          supplierId={selectedSupplierForEvaluation.id}
        />
      )}

      {selectedSupplierForHistory && (
        <SupplierEvaluationHistoryModal
          isOpen={showEvaluationHistoryModal}
          onClose={() => {
            setShowEvaluationHistoryModal(false);
            setSelectedSupplierForHistory(null);
          }}
          supplierName={selectedSupplierForHistory.name}
          histories={[]}
        />
      )}

      {selectedSupplierForAnalysis && (
        <EvaluationAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedSupplierForAnalysis(null);
          }}
          supplierName={selectedSupplierForAnalysis.name}
          evaluationData={[]}
        />
      )}

      <EvaluationBatchExportModal
        isOpen={showBatchExportModal}
        onClose={() => setShowBatchExportModal(false)}
        evaluations={[]}
        suppliers={suppliers}
      />

      {selectedSupplierForOrderHistory && (
        <SupplierOrderHistoryModal
          isOpen={showOrderHistoryModal}
          onClose={() => {
            setShowOrderHistoryModal(false);
            setSelectedSupplierForOrderHistory(null);
          }}
          supplierName={selectedSupplierForOrderHistory.name}
          histories={[]}
        />
      )}

      {selectedSupplierForPriceHistory && (
        <PriceHistoryModal
          isOpen={showPriceHistoryModal}
          onClose={() => {
            setShowPriceHistoryModal(false);
            setSelectedSupplierForPriceHistory(null);
          }}
          supplierName={selectedSupplierForPriceHistory.name}
          productName="阿莫西林胶囊"
          histories={[]}
        />
      )}

      {selectedSupplierForContract && (
        <SupplierContractModal
          isOpen={showContractModal}
          onClose={() => {
            setShowContractModal(false);
            setSelectedSupplierForContract(null);
          }}
          supplierName={selectedSupplierForContract.name}
          contracts={[]}
        />
      )}

      {selectedSupplierForQualification && (
        <SupplierQualificationModal
          isOpen={showQualificationModal}
          onClose={() => {
            setShowQualificationModal(false);
            setSelectedSupplierForQualification(null);
          }}
          supplierName={selectedSupplierForQualification.name}
          qualifications={[]}
        />
      )}

      {selectedSupplierForPerformance && (
        <SupplierPerformanceModal
          isOpen={showPerformanceModal}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedSupplierForPerformance(null);
          }}
          supplierName={selectedSupplierForPerformance.name}
          performanceData={mockPerformanceData}
        />
      )}

      <SupplierRankingModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        rankings={[]}
      />

      {selectedSupplierForAnalysisReport && (
        <SupplierAnalysisModal
          isOpen={showAnalysisReportModal}
          onClose={() => {
            setShowAnalysisReportModal(false);
            setSelectedSupplierForAnalysisReport(null);
          }}
          supplierName={selectedSupplierForAnalysisReport.name}
          data={mockAnalysisData}
        />
      )}

      {selectedSupplierForPriceAnalysis && (
        <SupplierPriceAnalysisModal
          isOpen={showPriceAnalysisModal}
          onClose={() => {
            setShowPriceAnalysisModal(false);
            setSelectedSupplierForPriceAnalysis(null);
          }}
          supplierName={selectedSupplierForPriceAnalysis.name}
          data={mockPriceAnalysisData}
        />
      )}

      {selectedSupplierForOrderManagement && (
        <SupplierOrderManagementModal
          isOpen={showOrderManagementModal}
          onClose={() => {
            setShowOrderManagementModal(false);
            setSelectedSupplierForOrderManagement(null);
          }}
          supplierName={selectedSupplierForOrderManagement.name}
          orders={mockOrders}
          onCreateOrder={(order) => {
            console.log('Create order:', order);
            setShowOrderManagementModal(false);
          }}
          onUpdateOrder={(id, order) => {
            console.log('Update order:', id, order);
          }}
          onCancelOrder={(id) => {
            console.log('Cancel order:', id);
          }}
        />
      )}

      {selectedSupplierForQualityManagement && (
        <SupplierQualityManagementModal
          isOpen={showQualityManagementModal}
          onClose={() => {
            setShowQualityManagementModal(false);
            setSelectedSupplierForQualityManagement(null);
          }}
          supplierName={selectedSupplierForQualityManagement.name}
          records={mockQualityRecords}
          metrics={mockQualityMetrics}
          onAddRecord={(record) => {
            console.log('Add record:', record);
            setShowQualityManagementModal(false);
          }}
          onUpdateRecord={(id, record) => {
            console.log('Update record:', id, record);
          }}
        />
      )}

      {selectedSupplierForRiskAssessment && (
        <SupplierRiskAssessmentModal
          isOpen={showRiskAssessmentModal}
          onClose={() => {
            setShowRiskAssessmentModal(false);
            setSelectedSupplierForRiskAssessment(null);
          }}
          supplierName={selectedSupplierForRiskAssessment.name}
          data={mockRiskAssessmentData}
        />
      )}

      {selectedSupplierForCertificate && (
        <SupplierCertificateModal
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedSupplierForCertificate(null);
          }}
          supplierName={selectedSupplierForCertificate.name}
          certificates={mockCertificates}
          onAddCertificate={(certificate) => {
            console.log('Add certificate:', certificate);
            setShowCertificateModal(false);
          }}
          onUpdateCertificate={(id, certificate) => {
            console.log('Update certificate:', id, certificate);
          }}
          onDeleteCertificate={(id) => {
            console.log('Delete certificate:', id);
          }}
        />
      )}

      {selectedSupplierForPerformanceReport && (
        <SupplierPerformanceReportModal
          isOpen={showPerformanceReportModal}
          onClose={() => {
            setShowPerformanceReportModal(false);
            setSelectedSupplierForPerformanceReport(null);
          }}
          supplierName={selectedSupplierForPerformanceReport.name}
          report={mockPerformanceReport}
        />
      )}
    </div>
  );
} 
'use client';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';

interface QualityRecord {
  id: string;
  inspectionDate: string;
  batchNumber: string;
  productName: string;
  sampleSize: number;
  defectCount: number;
  defectRate: number;
  defectTypes: {
    type: string;
    count: number;
    severity: 'critical' | 'major' | 'minor';
  }[];
  inspectionResult: 'pass' | 'fail' | 'pending';
  inspector: string;
  remarks?: string;
  correctiveActions?: string[];
}

interface QualityMetrics {
  totalInspections: number;
  passRate: number;
  averageDefectRate: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
  trends: {
    date: string;
    defectRate: number;
    passRate: number;
  }[];
}

interface SupplierQualityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  records: QualityRecord[];
  metrics: QualityMetrics;
  onAddRecord: (record: Omit<QualityRecord, 'id'>) => void;
  onUpdateRecord: (id: string, record: Partial<QualityRecord>) => void;
}

const defaultRecord: Omit<QualityRecord, 'id'> = {
  inspectionDate: new Date().toISOString().split('T')[0],
  batchNumber: '',
  productName: '',
  sampleSize: 0,
  defectCount: 0,
  defectRate: 0,
  defectTypes: [],
  inspectionResult: 'pending',
  inspector: '',
  correctiveActions: [],
};

export default function SupplierQualityManagementModal({
  isOpen,
  onClose,
  supplierName,
  records,
  metrics,
  onAddRecord,
  onUpdateRecord,
}: SupplierQualityManagementModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState(defaultRecord);
  const [newDefectType, setNewDefectType] = useState<{
    type: string;
    count: number;
    severity: QualityRecord['defectTypes'][number]['severity'];
  }>({
    type: '',
    count: 0,
    severity: 'minor',
  });
  const [newAction, setNewAction] = useState('');

  if (!isOpen) return null;

  // 质量趋势图配置
  const trendOption = {
    title: {
      text: '质量趋势分析',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['合格率', '缺陷率'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: metrics.trends.map(t => t.date),
    },
    yAxis: {
      type: 'value',
      name: '百分比',
      min: 0,
      max: 100,
    },
    series: [
      {
        name: '合格率',
        type: 'line',
        data: metrics.trends.map(t => t.passRate),
        smooth: true,
      },
      {
        name: '缺陷率',
        type: 'line',
        data: metrics.trends.map(t => t.defectRate),
        smooth: true,
      },
    ],
  };

  // 缺陷分布图配置
  const defectOption = {
    title: {
      text: '缺陷类型分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: metrics.criticalDefects, name: '严重缺陷' },
          { value: metrics.majorDefects, name: '主要缺陷' },
          { value: metrics.minorDefects, name: '���要缺陷' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const handleExportExcel = () => {
    const exportData = records.map(record => ({
      '检验日期': record.inspectionDate,
      '批次号': record.batchNumber,
      '产品名称': record.productName,
      '样本数量': record.sampleSize,
      '缺陷数量': record.defectCount,
      '缺陷率': `${record.defectRate}%`,
      '检验结果': record.inspectionResult === 'pass' ? '通过' :
                 record.inspectionResult === 'fail' ? '不通过' : '待定',
      '检验员': record.inspector,
      '备注': record.remarks || '',
      '纠正措施': record.correctiveActions?.join('；') || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "质量记录");
    XLSX.writeFile(wb, `${supplierName}_质量记录_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddRecord) {
      onAddRecord({
        ...newRecord,
        defectRate: newRecord.defectCount / newRecord.sampleSize * 100,
      });
      setNewRecord(defaultRecord);
      setIsAdding(false);
    }
  };

  const handleAddDefectType = () => {
    if (newDefectType.type && newDefectType.count > 0) {
      setNewRecord({
        ...newRecord,
        defectTypes: [...newRecord.defectTypes, newDefectType],
        defectCount: newRecord.defectCount + newDefectType.count,
      });
      setNewDefectType({
        type: '',
        count: 0,
        severity: 'minor',
      });
    }
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setNewRecord({
        ...newRecord,
        correctiveActions: [...(newRecord.correctiveActions || []), newAction.trim()],
      });
      setNewAction('');
    }
  };

  const getResultColor = (result: QualityRecord['inspectionResult']) => {
    switch (result) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResultLabel = (result: QualityRecord['inspectionResult']) => {
    switch (result) {
      case 'pass': return '通过';
      case 'fail': return '不通过';
      case 'pending': return '待定';
      default: return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            质量管理 - {supplierName}
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
          {/* 质量指标概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                检验总数
              </h4>
              <p className="text-2xl font-semibold mt-2">
                {metrics.totalInspections}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                合格率
              </h4>
              <p className="text-2xl font-semibold mt-2 text-green-600">
                {metrics.passRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                平均缺陷率
              </h4>
              <p className="text-2xl font-semibold mt-2 text-yellow-600">
                {metrics.averageDefectRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                严重缺陷
              </h4>
              <p className="text-2xl font-semibold mt-2 text-red-600">
                {metrics.criticalDefects}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={trendOption} style={{ height: '400px' }} />
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <ReactECharts option={defectOption} style={{ height: '400px' }} />
            </div>
          </div>

          {/* 添加记录按钮 */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              添加检验记录
            </button>
          )}

          {/* 添加记录表单 */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    检验日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newRecord.inspectionDate}
                    onChange={(e) => setNewRecord({ ...newRecord, inspectionDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    批次号
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecord.batchNumber}
                    onChange={(e) => setNewRecord({ ...newRecord, batchNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    产品名称
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecord.productName}
                    onChange={(e) => setNewRecord({ ...newRecord, productName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    样本数量
                  </label>
                  <input
                    type="number"
                    required
                    value={newRecord.sampleSize}
                    onChange={(e) => setNewRecord({ ...newRecord, sampleSize: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    检验结果
                  </label>
                  <select
                    value={newRecord.inspectionResult}
                    onChange={(e) => setNewRecord({ ...newRecord, inspectionResult: e.target.value as QualityRecord['inspectionResult'] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">待定</option>
                    <option value="pass">通过</option>
                    <option value="fail">不通过</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    检验员
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecord.inspector}
                    onChange={(e) => setNewRecord({ ...newRecord, inspector: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* 缺陷类型 */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">缺陷类型</h4>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="缺陷类型"
                    value={newDefectType.type}
                    onChange={(e) => setNewDefectType({ ...newDefectType, type: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="数量"
                    value={newDefectType.count || ''}
                    onChange={(e) => setNewDefectType({ ...newDefectType, count: parseInt(e.target.value) })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={newDefectType.severity}
                    onChange={(e) => setNewDefectType({
                      ...newDefectType,
                      severity: e.target.value as QualityRecord['defectTypes'][number]['severity']
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="minor">次要</option>
                    <option value="major">主要</option>
                    <option value="critical">严重</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDefectType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    添加
                  </button>
                </div>
                <div className="space-y-2">
                  {newRecord.defectTypes.map((defect, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                      <div>
                        <span className="font-medium">{defect.type}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          数量：{defect.count}，
                          严重程度：{
                            defect.severity === 'critical' ? '严重' :
                            defect.severity === 'major' ? '主要' : '次要'
                          }
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewRecord({
                            ...newRecord,
                            defectTypes: newRecord.defectTypes.filter((_, i) => i !== index),
                            defectCount: newRecord.defectCount - defect.count,
                          });
                        }}
                        className="text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 纠正措施 */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">纠正措施</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="输入纠正措施"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    添加
                  </button>
                </div>
                <div className="space-y-2">
                  {newRecord.correctiveActions?.map((action, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                      <span>{action}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewRecord({
                            ...newRecord,
                            correctiveActions: newRecord.correctiveActions?.filter((_, i) => i !== index),
                          });
                        }}
                        className="text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  保存
                </button>
              </div>
            </form>
          )}

          {/* 检验记录列表 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">检验记录</h4>
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">
                      批次号：{record.batchNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      产品：{record.productName}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getResultColor(record.inspectionResult)}`}>
                    {getResultLabel(record.inspectionResult)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">检验日期</div>
                    <div className="mt-1">{record.inspectionDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">样本数量</div>
                    <div className="mt-1">{record.sampleSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">缺陷数量</div>
                    <div className="mt-1">{record.defectCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">缺陷率</div>
                    <div className="mt-1">{record.defectRate}%</div>
                  </div>
                </div>

                {record.defectTypes.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">缺陷类型</div>
                    <div className="mt-2 space-y-2">
                      {record.defectTypes.map((defect, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                          <span className="font-medium">{defect.type}</span>
                          <span className="ml-2 text-sm">
                            数量：{defect.count}，
                            严重程度：{
                              defect.severity === 'critical' ? '严重' :
                              defect.severity === 'major' ? '主要' : '次要'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {record.correctiveActions && record.correctiveActions.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">纠正措施</div>
                    <div className="mt-2 space-y-2">
                      {record.correctiveActions.map((action, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {record.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{record.remarks}
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  检验员：{record.inspector}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
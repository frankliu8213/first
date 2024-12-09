'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface Qualification {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'business' | 'quality' | 'production' | 'other';
  name: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring';
  issuingAuthority: string;
  attachments: {
    name: string;
    url: string;
    uploadDate: string;
  }[];
  remarks?: string;
}

interface SupplierQualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  qualifications: Qualification[];
}

const mockQualifications: Qualification[] = [
  {
    id: '1',
    supplierId: '1',
    supplierName: '医药供应商A',
    type: 'business',
    name: '营业执照',
    number: 'XYZ123456789',
    issueDate: '2023-01-01',
    expiryDate: '2025-12-31',
    status: 'valid',
    issuingAuthority: '市场监督管理局',
    attachments: [
      {
        name: '营业执照.pdf',
        url: '/qualifications/business.pdf',
        uploadDate: '2023-01-01',
      }
    ],
    remarks: '年检��通过',
  },
  {
    id: '2',
    supplierId: '1',
    supplierName: '医药供应商A',
    type: 'quality',
    name: 'GMP认证',
    number: 'GMP2024001',
    issueDate: '2024-01-01',
    expiryDate: '2024-12-31',
    status: 'valid',
    issuingAuthority: '国家药品监督管理局',
    attachments: [
      {
        name: 'GMP证书.pdf',
        url: '/qualifications/gmp.pdf',
        uploadDate: '2024-01-01',
      }
    ],
  },
];

export default function SupplierQualificationModal({
  isOpen,
  onClose,
  supplierName,
  qualifications = mockQualifications,
}: SupplierQualificationModalProps) {
  const [selectedType, setSelectedType] = useState<'all' | Qualification['type']>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Qualification['status']>('all');
  const [showExpiring, setShowExpiring] = useState(false);

  if (!isOpen) return null;

  const getFilteredQualifications = () => {
    return qualifications.filter(qualification => {
      const matchesType = selectedType === 'all' || qualification.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || qualification.status === selectedStatus;
      
      if (showExpiring) {
        const expiryDate = new Date(qualification.expiryDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return matchesType && matchesStatus && expiryDate <= threeMonthsFromNow;
      }
      
      return matchesType && matchesStatus;
    });
  };

  const getStatusColor = (status: Qualification['status']) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'expiring': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Qualification['status']) => {
    switch (status) {
      case 'valid': return '有效';
      case 'expired': return '已过期';
      case 'expiring': return '即将过期';
      default: return '未知状态';
    }
  };

  const getTypeLabel = (type: Qualification['type']) => {
    switch (type) {
      case 'business': return '营业资质';
      case 'quality': return '质量认证';
      case 'production': return '生产许可';
      case 'other': return '其他资质';
      default: return '未知类型';
    }
  };

  const handleExportExcel = () => {
    const exportData = qualifications.map(qualification => ({
      '资质名称': qualification.name,
      '资质类型': getTypeLabel(qualification.type),
      '证书编号': qualification.number,
      '发证日期': qualification.issueDate,
      '到期日期': qualification.expiryDate,
      '状态': getStatusLabel(qualification.status),
      '发证机构': qualification.issuingAuthority,
      '备注': qualification.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "资质记录");
    XLSX.writeFile(wb, `${supplierName}_资质记录_${new Date().toLocaleDateString()}.xlsx`);
  };

  const filteredQualifications = getFilteredQualifications();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            资质管理 - {supplierName}
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
          {/* 筛选器 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部类型' },
                { value: 'business', label: '营业资质' },
                { value: 'quality', label: '质量认证' },
                { value: 'production', label: '生产许可' },
                { value: 'other', label: '其他资质' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部状态' },
                { value: 'valid', label: '有效' },
                { value: 'expired', label: '已过期' },
                { value: 'expiring', label: '即将过期' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value as any)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedStatus === status.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showExpiring}
                onChange={(e) => setShowExpiring(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                显示即将过期
              </span>
            </label>
          </div>

          {/* 资质列表 */}
          <div className="space-y-4">
            {filteredQualifications.map((qualification) => (
              <div
                key={qualification.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {qualification.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      证书编号：{qualification.number}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(qualification.status)}`}>
                      {getStatusLabel(qualification.status)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getTypeLabel(qualification.type)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">发证日期：</span>{qualification.issueDate}</p>
                      <p><span className="text-gray-500">到期日期：</span>{qualification.expiryDate}</p>
                      <p><span className="text-gray-500">发证机构：</span>{qualification.issuingAuthority}</p>
                      {qualification.remarks && (
                        <p><span className="text-gray-500">备注：</span>{qualification.remarks}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      附件文件
                    </h4>
                    <div className="space-y-2">
                      {qualification.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{attachment.name}</span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            下载
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
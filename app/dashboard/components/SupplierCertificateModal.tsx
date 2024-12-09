'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface Certificate {
  id: string;
  name: string;
  type: '营业执照' | 'GSP认证' | 'GMP认证' | '药品经营许可证' | '医疗器械经营许可证' | '其他';
  number: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring';
  issuingAuthority: string;
  attachments?: string[];
  remarks?: string;
}

interface SupplierCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  certificates: Certificate[];
  onAddCertificate?: (certificate: Omit<Certificate, 'id'>) => void;
  onUpdateCertificate?: (id: string, certificate: Partial<Certificate>) => void;
  onDeleteCertificate?: (id: string) => void;
}

const defaultCertificate: Omit<Certificate, 'id'> = {
  name: '',
  type: '营业执照',
  number: '',
  issueDate: '',
  expiryDate: '',
  status: 'valid',
  issuingAuthority: '',
  attachments: [],
  remarks: '',
};

const certificateTypes = [
  '营业执照',
  'GSP认证',
  'GMP认证',
  '药品经营许可证',
  '医疗器械经营许可证',
  '其他',
] as const;

export default function SupplierCertificateModal({
  isOpen,
  onClose,
  supplierName,
  certificates,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
}: SupplierCertificateModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCertificate, setNewCertificate] = useState(defaultCertificate);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    const exportData = certificates.map(cert => ({
      '证书名称': cert.name,
      '证书类型': cert.type,
      '证书编号': cert.number,
      '发证日期': cert.issueDate,
      '有效期至': cert.expiryDate,
      '状态': cert.status === 'valid' ? '有效' :
             cert.status === 'expired' ? '已过期' : '即将过期',
      '发证机构': cert.issuingAuthority,
      '备注': cert.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "证书列表");
    XLSX.writeFile(wb, `${supplierName}_证书列表_${new Date().toLocaleDateString()}.xlsx`);
  };

  const getStatusColor = (status: Certificate['status']) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'expiring': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Certificate['status']) => {
    switch (status) {
      case 'valid': return '有效';
      case 'expired': return '已过期';
      case 'expiring': return '即将过期';
      default: return '未知状态';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddCertificate) {
      onAddCertificate(newCertificate);
      setNewCertificate(defaultCertificate);
      setIsAdding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            资质证书管理 - {supplierName}
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
          {/* 添加证书按钮 */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              添加证书
            </button>
          )}

          {/* 添加证书表单 */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    证书名称
                  </label>
                  <input
                    type="text"
                    required
                    value={newCertificate.name}
                    onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    证书类型
                  </label>
                  <select
                    required
                    value={newCertificate.type}
                    onChange={(e) => setNewCertificate({ ...newCertificate, type: e.target.value as Certificate['type'] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {certificateTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    证书编号
                  </label>
                  <input
                    type="text"
                    required
                    value={newCertificate.number}
                    onChange={(e) => setNewCertificate({ ...newCertificate, number: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    发证机构
                  </label>
                  <input
                    type="text"
                    required
                    value={newCertificate.issuingAuthority}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issuingAuthority: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    发证日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newCertificate.issueDate}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    有效期至
                  </label>
                  <input
                    type="date"
                    required
                    value={newCertificate.expiryDate}
                    onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  上传附件
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  备注
                </label>
                <textarea
                  value={newCertificate.remarks}
                  onChange={(e) => setNewCertificate({ ...newCertificate, remarks: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  保存
                </button>
              </div>
            </form>
          )}

          {/* 证书列表 */}
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">
                      {cert.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      证书编号：{cert.number}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cert.status)}`}>
                    {getStatusLabel(cert.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">证书类型</div>
                    <div className="mt-1">{cert.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">发证日期</div>
                    <div className="mt-1">{cert.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">有效期至</div>
                    <div className="mt-1">{cert.expiryDate}</div>
                  </div>
                </div>

                {cert.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{cert.remarks}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-4">
                  <button
                    onClick={() => onUpdateCertificate?.(cert.id, { status: 'valid' })}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDeleteCertificate?.(cert.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
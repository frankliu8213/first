'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Certificate {
  id: string;
  name: string;
  type: '营业执照' | 'GSP认证' | 'GMP认证' | '药品经营许可证' | '医疗器械经营许可证' | '其他';
  number: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring';
  issuingAuthority: string;
  attachments: string[];
  remarks?: string;
  renewalReminder: boolean;
  renewalReminderDays: number;
}

interface CertificateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  certificates: Certificate[];
  onAddCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  onUpdateCertificate: (id: string, certificate: Partial<Certificate>) => void;
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    name: '药品经营许可证',
    type: '药品经营许可证',
    number: 'YXJY20240001',
    issueDate: '2024-01-01',
    expiryDate: '2029-12-31',
    status: 'valid',
    issuingAuthority: '国家药品监督管理局',
    attachments: ['license.pdf'],
    remarks: '包含全品类经营资质',
    renewalReminder: true,
    renewalReminderDays: 90,
  },
  {
    id: '2',
    name: 'GSP认证证书',
    type: 'GSP认证',
    number: 'GSP20240001',
    issueDate: '2024-01-01',
    expiryDate: '2027-12-31',
    status: 'valid',
    issuingAuthority: '省药品监督管理局',
    attachments: ['gsp.pdf'],
    renewalReminder: true,
    renewalReminderDays: 60,
  },
];

export default function CertificateManagementModal({
  isOpen,
  onClose,
  supplierName,
  certificates = mockCertificates,
  onAddCertificate,
  onUpdateCertificate,
}: CertificateManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, 'id'>>({
    name: '',
    type: '营业执照',
    number: '',
    issueDate: '',
    expiryDate: '',
    status: 'valid',
    issuingAuthority: '',
    attachments: [],
    renewalReminder: true,
    renewalReminderDays: 90,
  });

  if (!isOpen) return null;

  const handleExportExcel = () => {
    const exportData = certificates.map(cert => ({
      '证书名称': cert.name,
      '证书类型': cert.type,
      '证书编号': cert.number,
      '发证日期': cert.issueDate,
      '有效期至': cert.expiryDate,
      '状态': cert.status === 'valid' ? '有效' : cert.status === 'expired' ? '已过期' : '即将过期',
      '发证机关': cert.issuingAuthority,
      '备注': cert.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "资质证书");
    XLSX.writeFile(wb, `${supplierName}_资质证书列表_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(16);
    doc.text(`供应商资质证书列表 - ${supplierName}`, 105, 15, { align: 'center' });
    
    // 添加证书数据
    const tableData = certificates.map(cert => [
      cert.name,
      cert.type,
      cert.number,
      cert.issueDate,
      cert.expiryDate,
      cert.status === 'valid' ? '有效' : cert.status === 'expired' ? '已过期' : '即将过期',
      cert.issuingAuthority,
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['证书名称', '类型', '编号', '发证日期', '有效期至', '状态', '发证机关']],
      body: tableData,
      theme: 'grid',
    });

    doc.save(`${supplierName}_资质证书列表_${new Date().toLocaleDateString()}.pdf`);
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
    onAddCertificate(newCertificate);
    setShowAddForm(false);
    setNewCertificate({
      name: '',
      type: '营业执照',
      number: '',
      issueDate: '',
      expiryDate: '',
      status: 'valid',
      issuingAuthority: '',
      attachments: [],
      renewalReminder: true,
      renewalReminderDays: 90,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
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
              onClick={handleExportPDF}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              导出PDF
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
          {/* 操作按钮 */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              添加证书
            </button>
            <div className="text-sm text-gray-500">
              共 {certificates.length} 个证书
            </div>
          </div>

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
                    <div className="text-sm text-gray-500 dark:text-gray-400">有效期</div>
                    <div className="mt-1">
                      {cert.issueDate} 至 {cert.expiryDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">发证机关</div>
                    <div className="mt-1">
                      {cert.issuingAuthority}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">证书类型</div>
                    <div className="mt-1">
                      {cert.type}
                    </div>
                  </div>
                </div>

                {cert.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{cert.remarks}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedCertificate(cert)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => {
                      onUpdateCertificate(cert.id, {
                        status: cert.status === 'valid' ? 'expired' : 'valid'
                      });
                    }}
                    className={`px-3 py-1 text-sm ${
                      cert.status === 'valid'
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {cert.status === 'valid' ? '设为过期' : '设为有效'}
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
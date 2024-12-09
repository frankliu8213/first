'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Contract {
  id: string;
  contractNumber: string;
  type: '采购合同' | '框架协议' | '质量协议' | '保密协议';
  status: '生效中' | '已到期' | '待续签' | '已终止';
  startDate: string;
  endDate: string;
  signDate: string;
  value: number;
  paymentTerms: string;
  attachments: string[];
  remarks?: string;
  renewalReminder: boolean;
  renewalReminderDays: number;
}

interface ContractManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  contracts: Contract[];
  onAddContract: (contract: Omit<Contract, 'id'>) => void;
  onUpdateContract: (id: string, contract: Partial<Contract>) => void;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    contractNumber: 'CT20240320001',
    type: '采购合同',
    status: '生效中',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    signDate: '2023-12-15',
    value: 1000000,
    paymentTerms: '月结30天',
    attachments: ['contract.pdf', 'appendix.pdf'],
    remarks: '年度采购合同',
    renewalReminder: true,
    renewalReminderDays: 30,
  },
  {
    id: '2',
    contractNumber: 'CT20240320002',
    type: '质量协议',
    status: '生效中',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    signDate: '2023-12-15',
    value: 0,
    paymentTerms: '不适用',
    attachments: ['quality_agreement.pdf'],
    renewalReminder: true,
    renewalReminderDays: 30,
  },
];

export default function ContractManagementModal({
  isOpen,
  onClose,
  supplierName,
  contracts = mockContracts,
  onAddContract,
  onUpdateContract,
}: ContractManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [newContract, setNewContract] = useState<Omit<Contract, 'id'>>({
    contractNumber: '',
    type: '采购合同',
    status: '生效中',
    startDate: '',
    endDate: '',
    signDate: '',
    value: 0,
    paymentTerms: '',
    attachments: [],
    renewalReminder: true,
    renewalReminderDays: 30,
  });

  if (!isOpen) return null;

  const handleExportExcel = () => {
    const exportData = contracts.map(contract => ({
      '合同编号': contract.contractNumber,
      '合同类型': contract.type,
      '状态': contract.status,
      '开始日期': contract.startDate,
      '结束日期': contract.endDate,
      '签订日期': contract.signDate,
      '合同金额': contract.value,
      '付款条件': contract.paymentTerms,
      '备注': contract.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "合同列表");
    XLSX.writeFile(wb, `${supplierName}_合同列表_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(16);
    doc.text(`供应商合同列表 - ${supplierName}`, 105, 15, { align: 'center' });
    
    // 添加合同数据
    const tableData = contracts.map(contract => [
      contract.contractNumber,
      contract.type,
      contract.status,
      contract.startDate,
      contract.endDate,
      contract.value.toLocaleString(),
      contract.paymentTerms,
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['合同编号', '类型', '状态', '开始日期', '结束日期', '金额', '付款条件']],
      body: tableData,
      theme: 'grid',
    });

    doc.save(`${supplierName}_合同列表_${new Date().toLocaleDateString()}.pdf`);
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case '生效中': return 'text-green-600 bg-green-100';
      case '已到期': return 'text-red-600 bg-red-100';
      case '待续签': return 'text-yellow-600 bg-yellow-100';
      case '已终止': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContract(newContract);
    setShowAddForm(false);
    setNewContract({
      contractNumber: '',
      type: '采购合同',
      status: '生效中',
      startDate: '',
      endDate: '',
      signDate: '',
      value: 0,
      paymentTerms: '',
      attachments: [],
      renewalReminder: true,
      renewalReminderDays: 30,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            合同管理 - {supplierName}
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
              新增合同
            </button>
            <div className="text-sm text-gray-500">
              共 {contracts.length} 份���同
            </div>
          </div>

          {/* 合同列表 */}
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">
                      {contract.contractNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      类型：{contract.type}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">有效期</div>
                    <div className="mt-1">
                      {contract.startDate} 至 {contract.endDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">合同金额</div>
                    <div className="mt-1">
                      ¥{contract.value.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">付款条件</div>
                    <div className="mt-1">
                      {contract.paymentTerms}
                    </div>
                  </div>
                </div>

                {contract.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{contract.remarks}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedContract(contract)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => {
                      onUpdateContract(contract.id, {
                        status: contract.status === '生效中' ? '已终止' : '生效中'
                      });
                    }}
                    className={`px-3 py-1 text-sm ${
                      contract.status === '生效中'
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {contract.status === '生效中' ? '终止合同' : '恢复合同'}
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
'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface Contract {
  id: string;
  contractNumber: string;
  type: '采购合同' | '框架协议' | '质量协议' | '保密协议' | '其他';
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  value?: number;
  paymentTerms?: string;
  attachments?: string[];
  remarks?: string;
  signedBy: string;
  signedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  terms: {
    category: string;
    content: string;
  }[];
}

interface SupplierContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierName: string;
  contracts: Contract[];
  onAddContract?: (contract: Omit<Contract, 'id'>) => void;
  onUpdateContract?: (id: string, contract: Partial<Contract>) => void;
  onDeleteContract?: (id: string) => void;
}

const defaultContract: Omit<Contract, 'id'> = {
  contractNumber: '',
  type: '采购合同',
  status: 'draft',
  startDate: '',
  endDate: '',
  signedBy: '',
  signedDate: '',
  terms: [],
};

const contractTypes = [
  '采购合同',
  '框架协议',
  '质量协议',
  '保密协议',
  '其他',
] as const;

export default function SupplierContractModal({
  isOpen,
  onClose,
  supplierName,
  contracts,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
}: SupplierContractModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContract, setNewContract] = useState(defaultContract);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTerm, setNewTerm] = useState({ category: '', content: '' });

  if (!isOpen) return null;

  const handleExportExcel = () => {
    const exportData = contracts.map(contract => ({
      '合同编号': contract.contractNumber,
      '合同类型': contract.type,
      '状态': contract.status === 'draft' ? '草稿' :
             contract.status === 'active' ? '生效中' :
             contract.status === 'expired' ? '已过期' : '已终止',
      '开始日期': contract.startDate,
      '结束日期': contract.endDate,
      '合同金额': contract.value || '',
      '付款条件': contract.paymentTerms || '',
      '签署人': contract.signedBy,
      '签署日期': contract.signedDate,
      '审批人': contract.approvedBy || '',
      '审批日期': contract.approvedDate || '',
      '备注': contract.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "合同列表");
    XLSX.writeFile(wb, `${supplierName}_合同列表_${new Date().toLocaleDateString()}.xlsx`);
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'terminated': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'active': return '生效中';
      case 'expired': return '已过期';
      case 'terminated': return '已终止';
      default: return '未知状态';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddContract) {
      onAddContract(newContract);
      setNewContract(defaultContract);
      setIsAdding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddTerm = () => {
    if (newTerm.category && newTerm.content) {
      setNewContract({
        ...newContract,
        terms: [...newContract.terms, newTerm],
      });
      setNewTerm({ category: '', content: '' });
    }
  };

  const handleRemoveTerm = (index: number) => {
    setNewContract({
      ...newContract,
      terms: newContract.terms.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
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
          {/* 添加合同按钮 */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              添加合同
            </button>
          )}

          {/* 添加合同表单 */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    合同编号
                  </label>
                  <input
                    type="text"
                    required
                    value={newContract.contractNumber}
                    onChange={(e) => setNewContract({ ...newContract, contractNumber: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    合同类型
                  </label>
                  <select
                    required
                    value={newContract.type}
                    onChange={(e) => setNewContract({ ...newContract, type: e.target.value as Contract['type'] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    {contractTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    开始日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newContract.startDate}
                    onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    结束日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newContract.endDate}
                    onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    合同金额
                  </label>
                  <input
                    type="number"
                    value={newContract.value || ''}
                    onChange={(e) => setNewContract({ ...newContract, value: parseFloat(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    付款条件
                  </label>
                  <input
                    type="text"
                    value={newContract.paymentTerms || ''}
                    onChange={(e) => setNewContract({ ...newContract, paymentTerms: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    签署人
                  </label>
                  <input
                    type="text"
                    required
                    value={newContract.signedBy}
                    onChange={(e) => setNewContract({ ...newContract, signedBy: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    签署日期
                  </label>
                  <input
                    type="date"
                    required
                    value={newContract.signedDate}
                    onChange={(e) => setNewContract({ ...newContract, signedDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* 合同条款 */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">合同条款</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="条款类别"
                    value={newTerm.category}
                    onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="条款内容"
                    value={newTerm.content}
                    onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    添加条款
                  </button>
                </div>
                <div className="space-y-2">
                  {newContract.terms.map((term, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md">
                      <div>
                        <span className="font-medium">{term.category}：</span>
                        <span>{term.content}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(index)}
                        className="text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  ))}
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
                  accept=".pdf,.doc,.docx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  备注
                </label>
                <textarea
                  value={newContract.remarks || ''}
                  onChange={(e) => setNewContract({ ...newContract, remarks: e.target.value })}
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
                    {getStatusLabel(contract.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">有效期</div>
                    <div className="mt-1">
                      {contract.startDate} 至 {contract.endDate}
                    </div>
                  </div>
                  {contract.value && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">合同金额</div>
                      <div className="mt-1">¥{contract.value.toLocaleString()}</div>
                    </div>
                  )}
                  {contract.paymentTerms && (
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">付款条件</div>
                      <div className="mt-1">{contract.paymentTerms}</div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">签署信息</div>
                  <div className="mt-1">
                    签署人：{contract.signedBy}，签署日期：{contract.signedDate}
                  </div>
                  {contract.approvedBy && (
                    <div className="mt-1">
                      审批人：{contract.approvedBy}，审批日期：{contract.approvedDate}
                    </div>
                  )}
                </div>

                {contract.terms.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">主要条款</div>
                    <div className="mt-2 space-y-2">
                      {contract.terms.map((term, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                          <span className="font-medium">{term.category}：</span>
                          {term.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contract.remarks && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    备注：{contract.remarks}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-4">
                  <button
                    onClick={() => onUpdateContract?.(contract.id, { status: 'active' })}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDeleteContract?.(contract.id)}
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

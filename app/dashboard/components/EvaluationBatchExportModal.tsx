'use client';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// 扩展 jsPDF 类型
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface EvaluationData {
  id: string;
  supplierId: string;
  supplierName: string;
  evaluationDate: string;
  evaluator: string;
  overallScore: number;
  categories: {
    qualityScore: number;
    deliveryScore: number;
    priceScore: number;
    serviceScore: number;
    cooperationScore: number;
  };
  recommendations: string[];
}

interface EvaluationBatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: EvaluationData[];
  suppliers: { id: string; name: string; category: string[] }[];
}

export default function EvaluationBatchExportModal({
  isOpen,
  onClose,
  evaluations,
  suppliers,
}: EvaluationBatchExportModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const [loading, setLoading] = useState(false);

  // 使用 useEffect 来处理客户端状态的初始化
  useEffect(() => {
    if (!isOpen) {
      // 重置状态
      setSelectedSuppliers([]);
      setDateRange({ start: '', end: '' });
      setExportFormat('excel');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const filteredEvaluations = evaluations.filter(evaluation => {
        const matchesSupplier = selectedSuppliers.length === 0 || 
          selectedSuppliers.includes(evaluation.supplierId);
        const evaluationDate = new Date(evaluation.evaluationDate);
        const matchesDateRange = (!dateRange.start || evaluationDate >= new Date(dateRange.start)) &&
          (!dateRange.end || evaluationDate <= new Date(dateRange.end));
        return matchesSupplier && matchesDateRange;
      });

      // 使用客户端时间
      const fileName = `供应商评估报告_${new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '-')}`;

      if (exportFormat === 'excel') {
        const exportData = filteredEvaluations.map(evaluation => ({
          '供应商': evaluation.supplierName,
          '评估日期': evaluation.evaluationDate,
          '评估人': evaluation.evaluator,
          '总评分': evaluation.overallScore.toFixed(1),
          '产品质量': evaluation.categories.qualityScore.toFixed(1),
          '交付表现': evaluation.categories.deliveryScore.toFixed(1),
          '价格竞争力': evaluation.categories.priceScore.toFixed(1),
          '服务质量': evaluation.categories.serviceScore.toFixed(1),
          '合作态度': evaluation.categories.cooperationScore.toFixed(1),
          '改进建议': evaluation.recommendations.join('；'),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "评估报告");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else {
        const doc = new jsPDF();
        
        // 添加标题
        doc.setFontSize(16);
        doc.text('供应商评估报告', 105, 15, { align: 'center' });
        
        // 添加筛选条件
        doc.setFontSize(10);
        doc.text(`导出日期：${new Date().toLocaleDateString('zh-CN')}`, 14, 25);
        if (dateRange.start || dateRange.end) {
          doc.text(`评估期间：${dateRange.start || '不限'} 至 ${dateRange.end || '不限'}`, 14, 32);
        }

        // 添加评估数据表格
        const tableData = filteredEvaluations.map(evaluation => [
          evaluation.supplierName,
          evaluation.evaluationDate,
          evaluation.evaluator,
          evaluation.overallScore.toFixed(1),
          evaluation.categories.qualityScore.toFixed(1),
          evaluation.categories.deliveryScore.toFixed(1),
          evaluation.categories.priceScore.toFixed(1),
          evaluation.categories.serviceScore.toFixed(1),
          evaluation.categories.cooperationScore.toFixed(1),
        ]);

        (doc as any).autoTable({
          startY: 40,
          head: [['供应商', '评估日期', '评估人', '总评分', '产品质量', '交付表现', '价格竞争力', '服务质量', '合作态度']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
        });

        // 添加改进建议
        let y = (doc as any).lastAutoTable.finalY + 10;
        filteredEvaluations.forEach(evaluation => {
          if (evaluation.recommendations.length > 0) {
            doc.setFontSize(9);
            doc.text(`${evaluation.supplierName} - 改进建议：`, 14, y);
            y += 5;
            doc.setFontSize(8);
            evaluation.recommendations.forEach(recommendation => {
              doc.text(`• ${recommendation}`, 20, y);
              y += 5;
            });
            y += 5;
          }
        });

        doc.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            批量导出评估报告
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择供应商
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {suppliers.map((supplier) => (
                <label key={supplier.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                      } else {
                        setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {supplier.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              导出格式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={exportFormat === 'excel'}
                  onChange={() => setExportFormat('excel')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Excel
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  PDF
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '导出中...' : '导出报告'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
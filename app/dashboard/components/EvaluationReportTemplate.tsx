'use client';
import { useState } from 'react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: {
    title: string;
    content: string;
    type: 'text' | 'score' | 'recommendation';
    order: number;
  }[];
  style: {
    headerLogo?: boolean;
    footerSignature?: boolean;
    pageNumbers?: boolean;
    watermark?: boolean;
  };
}

interface EvaluationReportTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ReportTemplate) => void;
  onApply: (templateId: string, evaluationIds: string[]) => void;
  templates: ReportTemplate[];
}

const defaultTemplate: Omit<ReportTemplate, 'id'> = {
  name: '',
  description: '',
  sections: [
    {
      title: '基本信息',
      content: '{{supplierName}}\n{{evaluationDate}}\n{{evaluator}}',
      type: 'text',
      order: 1,
    },
    {
      title: '评分详情',
      content: '{{scores}}',
      type: 'score',
      order: 2,
    },
    {
      title: '改进建议',
      content: '{{recommendations}}',
      type: 'recommendation',
      order: 3,
    },
  ],
  style: {
    headerLogo: true,
    footerSignature: true,
    pageNumbers: true,
    watermark: false,
  },
};

export default function EvaluationReportTemplate({
  isOpen,
  onClose,
  onSave,
  onApply,
  templates = [],
}: EvaluationReportTemplateProps) {
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Omit<ReportTemplate, 'id'>>(defaultTemplate);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    type: 'text' as const,
    order: 0,
  });

  if (!isOpen) return null;

  const handleSaveTemplate = () => {
    onSave({
      ...newTemplate,
      id: Date.now().toString(),
    });
    setShowNewTemplate(false);
    setNewTemplate(defaultTemplate);
  };

  const handleAddSection = () => {
    if (newSection.title && newSection.content) {
      setNewTemplate({
        ...newTemplate,
        sections: [
          ...newTemplate.sections,
          {
            ...newSection,
            order: newTemplate.sections.length + 1,
          },
        ],
      });
      setNewSection({
        title: '',
        content: '',
        type: 'text',
        order: 0,
      });
    }
  };

  const handleRemoveSection = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      sections: newTemplate.sections.filter((_, i) => i !== index),
    });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...newTemplate.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setNewTemplate({
      ...newTemplate,
      sections: newSections.map((section, i) => ({ ...section, order: i + 1 })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            评估报告模板
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

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setShowNewTemplate(!showNewTemplate)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showNewTemplate ? '查看模板列表' : '创建新模板'}
            </button>
          </div>

          {showNewTemplate ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  模板名称
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  描述
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">报告章节</h4>
                {newTemplate.sections.map((section, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{section.title}</h5>
                        <p className="text-sm text-gray-500 mt-1">{section.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveSection(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveSection(index, 'down')}
                          disabled={index === newTemplate.sections.length - 1}
                          className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleRemoveSection(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <pre className="mt-2 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {section.content}
                    </pre>
                  </div>
                ))}

                <div className="p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        章节标题
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        类型
                      </label>
                      <select
                        value={newSection.type}
                        onChange={(e) => setNewSection({ ...newSection, type: e.target.value as any })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="text">文本</option>
                        <option value="score">评分</option>
                        <option value="recommendation">建议</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      内容模板
                    </label>
                    <textarea
                      value={newSection.content}
                      onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                      rows={3}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddSection}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      添加章节
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">样式设置</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTemplate.style.headerLogo}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        style: { ...newTemplate.style, headerLogo: e.target.checked },
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">显示页眉Logo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTemplate.style.footerSignature}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        style: { ...newTemplate.style, footerSignature: e.target.checked },
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">显示签名栏</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTemplate.style.pageNumbers}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        style: { ...newTemplate.style, pageNumbers: e.target.checked },
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">显示页码</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTemplate.style.watermark}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        style: { ...newTemplate.style, watermark: e.target.checked },
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">添加水印</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存模板
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  <div className="mt-2">
                    <div className="text-sm">章节数：{template.sections.length}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(template.style).map(([key, value]) => (
                        value && (
                          <span
                            key={key}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {key === 'headerLogo' ? '页眉Logo' :
                             key === 'footerSignature' ? '签名栏' :
                             key === 'pageNumbers' ? '页码' : '水印'}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
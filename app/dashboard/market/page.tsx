'use client';
import ReactECharts from 'echarts-for-react';

export default function MarketAnalysis() {
  // 市场份额趋势图配置
  const marketShareOptions = {
    title: {
      text: '市场份额趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['我司', '竞品A', '竞品B', '竞品C'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      name: '市场份额(%)'
    },
    series: [
      {
        name: '我司',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [27, 28, 29, 31, 32, 33]
      },
      {
        name: '竞品A',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [25, 24, 23, 22, 21, 20]
      },
      {
        name: '竞品B',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [18, 19, 18, 17, 16, 15]
      },
      {
        name: '竞品C',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [15, 14, 13, 12, 11, 10]
      }
    ]
  };

  // 竞品价格对比图配置
  const priceComparisonOptions = {
    title: {
      text: '主要产品价格对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['我司', '竞品均价'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '价格（元）'
    },
    yAxis: {
      type: 'category',
      data: ['产品A', '产品B', '产品C', '产品D', '产品E']
    },
    series: [
      {
        name: '我司',
        type: 'bar',
        data: [120, 200, 150, 80, 70],
        itemStyle: {
          color: '#3b82f6'
        }
      },
      {
        name: '竞品均价',
        type: 'bar',
        data: [100, 220, 180, 85, 90],
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">市场分析</h1>
        <div className="flex gap-4">
          <select className="px-4 py-2 border rounded-md">
            <option value="all">全部地区</option>
            <option value="north">华北地区</option>
            <option value="south">华南地区</option>
            <option value="east">华东地区</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            导出分析报告
          </button>
        </div>
      </div>

      {/* 市场概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">市场份额</h3>
          <p className="text-2xl font-semibold mt-2">33%</p>
          <span className="text-green-600 text-sm">领先竞品13%</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">品牌影响力</h3>
          <p className="text-2xl font-semibold mt-2">89分</p>
          <span className="text-green-600 text-sm">较上月+2.3分</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">客户满意度</h3>
          <p className="text-2xl font-semibold mt-2">4.8</p>
          <span className="text-green-600 text-sm">优于行业平均</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">市场覆盖率</h3>
          <p className="text-2xl font-semibold mt-2">85%</p>
          <span className="text-blue-600 text-sm">已覆盖主要市场</span>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <ReactECharts option={marketShareOptions} style={{ height: '400px' }} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <ReactECharts option={priceComparisonOptions} style={{ height: '400px' }} />
        </div>
      </div>

      {/* 竞品分析表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">主要竞品分析</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-3">竞品名称</th>
              <th className="text-right">市场份额</th>
              <th className="text-right">价格区间</th>
              <th className="text-right">主要优势</th>
              <th className="text-right">威胁等级</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: '竞品A', share: '20%', price: '￥80-120', advantage: '价格优势', threat: '高' },
              { name: '竞品B', share: '15%', price: '￥100-150', advantage: '品牌知名度', threat: '中' },
              { name: '竞品C', share: '10%', price: '￥90-130', advantage: '渠道优势', threat: '中' },
              { name: '竞品D', share: '8%', price: '￥70-100', advantage: '性价比', threat: '低' },
            ].map((item, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="py-3">{item.name}</td>
                <td className="text-right">{item.share}</td>
                <td className="text-right">{item.price}</td>
                <td className="text-right">{item.advantage}</td>
                <td className="text-right">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    item.threat === '高' ? 'bg-red-100 text-red-800' :
                    item.threat === '中' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.threat}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
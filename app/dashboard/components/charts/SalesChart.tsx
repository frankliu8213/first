'use client';
import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

export default function SalesChart() {
  const [options, setOptions] = useState({
    title: {
      text: '月度销售趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      name: '销售额 (万元)'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: [150, 230, 224, 218, 135, 147],
        itemStyle: {
          color: '#3b82f6'
        }
      }
    ]
  });

  return (
    <ReactECharts
      option={options}
      style={{ height: '400px' }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4"
    />
  );
} 
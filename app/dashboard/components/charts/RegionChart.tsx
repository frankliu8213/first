'use client';
import ReactECharts from 'echarts-for-react';

export default function RegionChart() {
  const options = {
    title: {
      text: '区域销售分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['目标', '实际'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['华东', '华南', '华北', '西南', '东北']
    },
    series: [
      {
        name: '目标',
        type: 'bar',
        data: [100, 80, 70, 60, 50],
        itemStyle: {
          color: '#3b82f6'
        }
      },
      {
        name: '实际',
        type: 'bar',
        data: [90, 85, 65, 55, 45],
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  };

  return (
    <ReactECharts
      option={options}
      style={{ height: '400px' }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4"
    />
  );
} 
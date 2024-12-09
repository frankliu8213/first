'use client';
import ReactECharts from 'echarts-for-react';

export default function ProductChart() {
  const options = {
    title: {
      text: '产品销售占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '抗生素' },
          { value: 735, name: '维生素' },
          { value: 580, name: '感冒药' },
          { value: 484, name: '止痛药' },
          { value: 300, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
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
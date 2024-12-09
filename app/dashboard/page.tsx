import SalesChart from './components/charts/SalesChart';
import ProductChart from './components/charts/ProductChart';
import RegionChart from './components/charts/RegionChart';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">数据概览</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 统计卡片 */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">总销售额</h3>
          <p className="text-2xl font-semibold mt-2">¥24,567</p>
          <span className="text-green-600 text-sm">较上月增长2.5%</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">在售产品</h3>
          <p className="text-2xl font-semibold mt-2">1,234</p>
          <span className="text-blue-600 text-sm">本周新增23个</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">库存预警</h3>
          <p className="text-2xl font-semibold mt-2">45</p>
          <span className="text-red-600 text-sm">需要关注</span>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">市场份额</h3>
          <p className="text-2xl font-semibold mt-2">27%</p>
          <span className="text-green-600 text-sm">增长1.2%</span>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-2">
          <SalesChart />
        </div>
        <div>
          <ProductChart />
        </div>
        <div>
          <RegionChart />
        </div>
      </div>
    </div>
  );
} 
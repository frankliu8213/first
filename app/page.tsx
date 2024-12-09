import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[60px_1fr_40px] min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/medical-logo.svg"
            alt="医疗数据分析平台 Logo"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-xl font-bold">医疗数据分析平台</h1>
        </div>
        <nav className="hidden sm:flex gap-6">
          <a href="/dashboard" className="hover:text-blue-600">数据概览</a>
          <a href="/sales" className="hover:text-blue-600">销售分析</a>
          <a href="/inventory" className="hover:text-blue-600">库存管理</a>
          <a href="/market" className="hover:text-blue-600">市场分析</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 items-center justify-center">
        <h2 className="text-3xl font-bold text-center">
          企业级医疗数据分析平台
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="flex flex-col gap-4 p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h3 className="text-xl font-semibold">实时数据分析</h3>
            <p className="text-gray-600 dark:text-gray-300">
              通过实时数据可视化和深度洞察，全面监控业务表现
            </p>
          </div>
          
          <div className="flex flex-col gap-4 p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h3 className="text-xl font-semibold">销售追踪</h3>
            <p className="text-gray-600 dark:text-gray-300">
              详细分析各区域和产品的销售表现，助力决策制定
            </p>
          </div>
          
          <div className="flex flex-col gap-4 p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h3 className="text-xl font-semibold">库存管理</h3>
            <p className="text-gray-600 dark:text-gray-300">
              智能预测和自动预警，优化库存管理效率
            </p>
          </div>
          
          <div className="flex flex-col gap-4 p-6 rounded-lg border border-black/[.08] dark:border-white/[.145]">
            <h3 className="text-xl font-semibold">市场洞察</h3>
            <p className="text-gray-600 dark:text-gray-300">
              把握市场趋势，获取竞争优势分析
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <a
            className="rounded-full bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
            href="/login"
          >
            立即开始
          </a>
          <a
            className="rounded-full border border-blue-600 text-blue-600 px-6 py-3 hover:bg-blue-50 transition-colors"
            href="/demo"
          >
            申请演示
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-center items-center text-sm text-gray-600">
        <p>© 2024 医疗数据分析平台. 保留所有权利</p>
      </footer>
    </div>
  );
}

const DashboardLoader = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-6">

        {/* Gradient Spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-indigo-500 border-l-blue-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>
        </div>

        {/* Bouncing Dots */}
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></span>
          <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-600 tracking-wide animate-pulse font-medium">
          Loading your dashboard...
        </p>

        {/* Skeleton Cards */}
        <div className="w-full max-w-3xl space-y-4 mt-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
            <div className="h-5 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-md p-5 animate-pulse">
            <div className="h-5 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-3"></div>
            <div className="h-32 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardLoader;

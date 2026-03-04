const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  </div>
);

export default FullScreenLoader;

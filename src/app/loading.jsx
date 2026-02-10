export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-indigo-950 text-white z-50">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-yellow-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg animate-pulse">Carregando...</p>
    </div>
  );
}

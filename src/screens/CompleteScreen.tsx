import { Download, RefreshCw } from 'lucide-react';

interface CompleteScreenProps {
  stats: {
    personal: number;
    tool: number;
    skip: number;
  };
  onReprocessSkips: () => void;
  onDownload: () => void;
}

export function CompleteScreen({ stats, onReprocessSkips, onDownload }: CompleteScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">仕分けが完了しました！</h1>
        <p className="text-gray-500 mb-10">お疲れ様でした。すべてのデータが分類されました。</p>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="text-sm font-semibold text-blue-600 mb-2">内面・認知</div>
            <div className="text-4xl font-bold text-blue-900">{stats.personal}</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="text-sm font-semibold text-purple-600 mb-2">道具・検索</div>
            <div className="text-4xl font-bold text-purple-900">{stats.tool}</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-sm font-semibold text-gray-600 mb-2">保留 (スキップ)</div>
            <div className="text-4xl font-bold text-gray-900">{stats.skip}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          {stats.skip > 0 && (
            <button
              onClick={onReprocessSkips}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              保留分を再分類する
            </button>
          )}

          <button
            onClick={onDownload}
            className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold transition-colors ${
              stats.personal > 0 || stats.tool > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={stats.personal === 0 && stats.tool === 0}
          >
            <Download className="w-5 h-5" />
            結果をダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}

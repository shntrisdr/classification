import { useState } from 'react';
import type { DragEvent } from 'react';
import { Upload } from 'lucide-react';

interface UploadScreenProps {
  onUpload: (data: string) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('JSONファイルのみアップロード可能です');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onUpload(content);
        setError(null);
      } catch {
        setError('ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">チャット履歴 スワイプ仕分け</h1>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-xl p-12 transition-colors duration-200 flex flex-col items-center justify-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <Upload className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            JSONファイルをドラッグ＆ドロップ
          </h2>
          <p className="text-gray-500 mb-6">または</p>

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            ファイルを選択
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatDisplayData, Category } from '../types';
import { X } from 'lucide-react';

interface SwipeScreenProps {
  items: ChatDisplayData[];
  onSwipe: (id: string, category: Category, originalIndex: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function SwipeScreen({ items, onSwipe, onUndo, canUndo }: SwipeScreenProps) {
  const [modalData, setModalData] = useState<ChatDisplayData | null>(null);

  const currentItem = items.length > 0 ? items[0] : null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (modalData) {
      if (e.key === 'Escape') {
        setModalData(null);
      }
      return;
    }

    if (!currentItem) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (canUndo) {
        onUndo();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        onSwipe(currentItem.id, 'PERSONAL', currentItem.originalIndex);
        break;
      case 'ArrowLeft':
        onSwipe(currentItem.id, 'TOOL', currentItem.originalIndex);
        break;
      case 'ArrowUp':
        onSwipe(currentItem.id, 'SKIP', currentItem.originalIndex);
        break;
    }
  }, [currentItem, modalData, onSwipe, onUndo, canUndo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentItem) return null;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden">

      {/* Background Instructions */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-8 text-gray-400 font-medium z-0 px-4 text-center">
        <div>← 道具・検索</div>
        <div>↑ 保留 (スキップ)</div>
        <div>内面・認知 →</div>
      </div>

      {canUndo && (
        <div className="absolute top-20 text-gray-400 text-sm z-0">
          Ctrl+Z (Cmd+Z) で元に戻す
        </div>
      )}

      {/* Remaining Count */}
      <div className="absolute bottom-8 right-8 text-gray-500 font-medium z-0">
        残り: {items.length}件
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{
            scale: 0.9,
            opacity: 0,
            x: (currentItem as any)._exitDir === 'PERSONAL' ? 500 : (currentItem as any)._exitDir === 'TOOL' ? -500 : 0,
            y: (currentItem as any)._exitDir === 'SKIP' ? -500 : 0,
            rotate: (currentItem as any)._exitDir === 'PERSONAL' ? 15 : (currentItem as any)._exitDir === 'TOOL' ? -15 : 0,
            transition: { duration: 0.3 }
          }}
          className="absolute z-10 w-full max-w-lg cursor-pointer perspective-1000"
          onClick={() => setModalData(currentItem)}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow min-h-[400px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-2">
              {currentItem.title}
            </h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">
              {currentItem.dateStr}
            </p>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                最初の発言
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-lg leading-relaxed whitespace-pre-wrap line-clamp-[8]">
                {currentItem.firstQuery}
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-gray-400 font-medium">
              クリックして全文を表示
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{modalData.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{modalData.dateStr}</p>
                </div>
                <button
                  onClick={() => setModalData(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-6">
                  {modalData.fullConversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-xs font-semibold text-gray-400 uppercase mb-1 px-1">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 whitespace-pre-wrap text-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

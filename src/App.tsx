import { useState, useCallback, useMemo } from 'react';
import { UploadScreen } from './screens/UploadScreen';
import { SwipeScreen } from './screens/SwipeScreen';
import { CompleteScreen } from './screens/CompleteScreen';
import { parseChatGPTExport } from './utils/parse';
import type { AppState, RawChatData, ChatDisplayData, Category, SwipeAction } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('UPLOAD');
  const [rawData, setRawData] = useState<RawChatData[]>([]);
  const [queue, setQueue] = useState<ChatDisplayData[]>([]);
  const [history, setHistory] = useState<SwipeAction[]>([]);

  // Derived state for classification categories
  const categories = useMemo(() => {
    const personal = new Set<number>();
    const tool = new Set<number>();
    const skip = new Set<number>();

    history.forEach(action => {
      // Remove from all first
      personal.delete(action.originalIndex);
      tool.delete(action.originalIndex);
      skip.delete(action.originalIndex);
      // Add to selected
      if (action.category === 'PERSONAL') personal.add(action.originalIndex);
      if (action.category === 'TOOL') tool.add(action.originalIndex);
      if (action.category === 'SKIP') skip.add(action.originalIndex);
    });

    return { personal, tool, skip };
  }, [history]);

  const handleUpload = useCallback((jsonString: string) => {
    try {
      const parsedRaw = JSON.parse(jsonString) as RawChatData[];
      if (!Array.isArray(parsedRaw)) {
        alert('ルートが配列のJSONファイルをアップロードしてください。');
        return;
      }
      const displayData = parseChatGPTExport(parsedRaw);
      setRawData(parsedRaw);
      setQueue(displayData);
      setHistory([]);
      setAppState(displayData.length > 0 ? 'SWIPE' : 'COMPLETE');
    } catch {
      alert('JSONのパースに失敗しました。');
    }
  }, []);

  const handleSwipe = useCallback((id: string, category: Category, originalIndex: number) => {
    setQueue(prev => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      // Animate exit direction logic is embedded in motion element via hack.
      (first as any)._exitDir = category;

      setHistory(h => [...h, { chatId: id, category, originalIndex }]);

      if (rest.length === 0) {
        setTimeout(() => setAppState('COMPLETE'), 300); // Wait for exit animation
      }
      return rest;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    setHistory(prev => {
      const newHistory = [...prev];
      const lastAction = newHistory.pop()!;

      // Find the item to restore based on originalIndex
      const itemToRestore = parseChatGPTExport([rawData[lastAction.originalIndex]])[0];
      itemToRestore.originalIndex = lastAction.originalIndex; // Fix: restore correct originalIndex

      setQueue(q => [itemToRestore, ...q]);

      return newHistory;
    });

    if (appState === 'COMPLETE') {
      setAppState('SWIPE');
    }
  }, [history, rawData, appState]);

  const handleReprocessSkips = useCallback(() => {
    const skips = Array.from(categories.skip).map(idx => {
      const parsed = parseChatGPTExport([rawData[idx]])[0];
      parsed.originalIndex = idx;
      return parsed;
    });

    // Remove skips from history
    setHistory(prev => prev.filter(h => h.category !== 'SKIP'));

    setQueue(skips);
    setAppState('SWIPE');
  }, [categories.skip, rawData]);

  const handleDownload = useCallback(() => {
    const personalData = Array.from(categories.personal).map(idx => rawData[idx]);
    const toolData = Array.from(categories.tool).map(idx => rawData[idx]);

    const downloadFile = (data: any, filename: string) => {
      if (data.length === 0) return;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    downloadFile(personalData, 'personal.json');
    downloadFile(toolData, 'tool.json');
  }, [categories, rawData]);

  return (
    <div className="min-h-screen text-gray-900 font-sans">
      {appState === 'UPLOAD' && (
        <UploadScreen onUpload={handleUpload} />
      )}

      {appState === 'SWIPE' && (
        <SwipeScreen
          items={queue}
          onSwipe={handleSwipe}
          onUndo={handleUndo}
          canUndo={history.length > 0}
        />
      )}

      {appState === 'COMPLETE' && (
        <CompleteScreen
          stats={{
            personal: categories.personal.size,
            tool: categories.tool.size,
            skip: categories.skip.size
          }}
          onReprocessSkips={handleReprocessSkips}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default App;

import { useState } from 'react'

type Message = { role: string; content: string }
type Chat = { id: string; title: string; messages: Message[] }

function App() {
  const [chatData, setChatData] = useState<Chat[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        setChatData(parsed)
        setError(null)
      } catch {
        setError('Invalid JSON file')
        setChatData(null)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Chat Swipe</h1>

      {!chatData && (
        <div className="mb-8 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <label className="block mb-4 text-lg font-medium text-gray-700">
            アップロードするJSONファイルを選択してください (Please upload a JSON file)
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 cursor-pointer mx-auto"
          />
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      )}

      {chatData && (
        <div className="grid gap-4">
          <button
            onClick={() => setChatData(null)}
            className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 w-fit"
          >
            別のファイルをアップロードする (Upload another file)
          </button>
          {chatData.map((chat) => (
            <div key={chat.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{chat.title}</h2>
              <div>
                {chat.messages.map((msg, idx) => (
                  <div key={idx} className="mb-1">
                    <strong>{msg.role}:</strong> {msg.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App

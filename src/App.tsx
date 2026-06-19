import testData from '../test.json'

function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Chat Swipe</h1>
      <div className="grid gap-4">
        {testData.map((chat) => (
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
    </div>
  )
}

export default App

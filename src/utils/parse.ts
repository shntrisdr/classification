import type { ChatDisplayData, RawChatData } from '../types';

export function parseChatGPTExport(data: RawChatData[]): ChatDisplayData[] {
  return data.map((chat, index) => {
    const title = chat.title || "No Title";
    const dateStr = chat.create_time
      ? new Date(chat.create_time * 1000).toLocaleDateString()
      : "Unknown Date";

    let fullConversation: { role: string; text: string }[] = [];
    if (chat.mapping) {
      const nodes = Object.values(chat.mapping) as any[];
      const validMessages = nodes
        .map(node => node.message)
        .filter(msg => msg && msg.author && msg.author.role)
        .sort((a, b) => {
           const timeA = a.create_time || 0;
           const timeB = b.create_time || 0;
           return timeA - timeB;
        });

      fullConversation = validMessages.map(msg => {
        let text = "";
        if (msg.content && Array.isArray(msg.content.parts)) {
          text = msg.content.parts.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)).join('\n');
        } else if (msg.content && typeof msg.content.text === 'string') {
           text = msg.content.text;
        }
        return {
          role: msg.author.role,
          text
        };
      }).filter(msg => msg.text.trim() !== "");
    } else {
       if (chat.messages) {
         fullConversation = chat.messages.map((m: any) => ({
           role: m.role,
           text: m.content
         }));
       }
    }

    const firstUserMsg = fullConversation.find(m => m.role === "user");
    const firstQuery = firstUserMsg ? firstUserMsg.text : "No user query";

    return {
      id: `chat_${index}_${chat.conversation_id || index}`,
      originalIndex: index,
      title,
      dateStr,
      firstQuery,
      fullConversation
    };
  });
}

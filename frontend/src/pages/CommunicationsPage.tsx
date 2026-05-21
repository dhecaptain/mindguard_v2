import { useEffect, useState, useRef } from 'react'
import { useCounsellorStore } from '../store/counsellorStore'
import { getConversations, getConversation, sendMessage } from '../api/counsellor'

function formatTime(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  const now = new Date()
  const diff = now.getTime() - dt.getTime()
  if (diff < 86400000) return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CommunicationsPage() {
  const {
    conversations, setConversations,
    activeConversation, setActiveConversation,
    messages, setMessages, addMessage,
    setLoading,
  } = useCounsellorStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation)
    }
  }, [activeConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[activeConversation || '']])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch {}
  }

  const loadMessages = async (otherId: string) => {
    setLoading(true)
    try {
      const data = await getConversation(otherId)
      setMessages(otherId, data)
    } catch {}
    setLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConversation || sending) return
    setSending(true)
    try {
      const msg = await sendMessage(activeConversation, input.trim())
      addMessage(activeConversation, msg)
      setInput('')
      loadConversations()
    } catch {}
    setSending(false)
  }

  const currentMessages = messages[activeConversation || ''] || []
  const activeConv = conversations.find((c) => c.other_id === activeConversation)

  return (
    <div className="flex flex-col gap-[16px] h-[calc(100vh-130px)]">
      <div>
        <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Communications</h2>
        <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">
          Message students and manage conversations
        </p>
      </div>

      <div className="flex gap-[12px] flex-1 min-h-0">
        {/* Conversation list */}
        <div className="w-[280px] flex-shrink-0 bg-white rounded-xl border border-[rgba(229,231,235,0.7)] flex flex-col">
          <div className="p-[12px] border-b border-[#f1f5f9]">
            <input
              placeholder="Search conversations..."
              className="w-full px-[10px] py-[7px] rounded-[7px] border border-[#e5e7eb] text-[0.78rem] outline-none focus:border-[#0F766E]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[40px] text-[#9ca3af]">
                <i className="ti ti-messages text-[28px] mb-[6px]" />
                <span className="text-[0.78rem]">No conversations</span>
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.other_id}
                  onClick={() => setActiveConversation(c.other_id)}
                  className={`px-[14px] py-[10px] cursor-pointer border-b border-[#f8fafc] transition-colors ${
                    activeConversation === c.other_id
                      ? 'bg-[#f0fdfa] border-l-[3px] border-l-[#0F766E]'
                      : 'hover:bg-[#f9fafb]'
                  }`}
                >
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-bold text-[0.7rem] flex-shrink-0">
                      {c.other_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.78rem] font-semibold text-[#1f2937] truncate">{c.other_name}</span>
                        <span className="text-[0.62rem] text-[#9ca3af] flex-shrink-0">{formatTime(c.last_time)}</span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <span className="text-[0.7rem] text-[#6b7280] truncate flex-1">{c.last_message || 'No messages'}</span>
                        {c.unread > 0 && (
                          <span className="bg-[#ef4444] text-white text-[0.55rem] font-bold px-[5px] py-[1px] rounded-full min-w-[16px] text-center flex-shrink-0">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-xl border border-[rgba(229,231,235,0.7)] flex flex-col">
          {!activeConversation ? (
            <div className="flex flex-col items-center justify-center flex-1 text-[#9ca3af]">
              <i className="ti ti-message text-[40px] mb-[10px]" />
              <span className="text-[0.9rem] font-medium">Select a conversation</span>
              <span className="text-[0.78rem]">Choose a student to start messaging</span>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-[18px] py-[12px] border-b border-[#f1f5f9] flex items-center gap-[10px]">
                <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-bold text-[0.72rem]">
                  {activeConv?.other_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-[0.85rem] font-semibold text-[#1f2937]">{activeConv?.other_name || 'Unknown'}</div>
                  <div className="text-[0.68rem] text-[#6b7280]">{activeConv?.other_email || ''}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-[18px] space-y-[8px]">
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[#9ca3af] text-[0.78rem]">
                    No messages yet. Send a message to start the conversation.
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMyMessage = msg.sender_id !== activeConversation
                    return (
                      <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-[14px] py-[9px] rounded-[14px] text-[0.82rem] ${
                            isMyMessage
                              ? 'bg-[#0F766E] text-white rounded-br-[4px]'
                              : 'bg-[#f3f4f6] text-[#1f2937] rounded-bl-[4px]'
                          }`}
                        >
                          {msg.message}
                          <div className={`text-[0.6rem] mt-[3px] ${isMyMessage ? 'text-[#a7f3d0]' : 'text-[#9ca3af]'}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-[18px] py-[12px] border-t border-[#f1f5f9] flex items-center gap-[10px]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-[14px] py-[9px] rounded-[10px] border border-[#e5e7eb] text-[0.82rem] outline-none focus:border-[#0F766E]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-[14px] py-[9px] bg-[#0F766E] text-white rounded-[10px] cursor-pointer hover:bg-[#115E59] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[6px] text-[0.82rem] font-semibold"
                >
                  <i className="ti ti-send text-[14px]" />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

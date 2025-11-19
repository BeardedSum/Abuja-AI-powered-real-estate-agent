import { useState, useRef, useEffect } from 'react';
import { useAgents } from '../hooks/useAgents';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, loading, clearMessages } = useAgents(userId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Focus back on input
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRobot className="text-2xl" />
          <div>
            <h3 className="font-semibold">Abuja Realty AI</h3>
            <p className="text-xs text-primary-100">Your AI Property Assistant</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-xs text-primary-100 hover:text-white"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <FaRobot className="text-6xl text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Welcome to Abuja Realty AI!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              I'm your AI property assistant. I can help you find properties, schedule
              viewings, make offers, and answer any questions about Abuja real estate.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'I want a 3-bedroom house in Gwarinpa',
                  'What properties are available under ₦50M?',
                  'Schedule a viewing for tomorrow',
                  'Tell me about Maitama neighborhood',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-xs bg-white hover:bg-primary-50 border border-gray-300 hover:border-primary-300 px-3 py-2 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {message.role === 'user' ? <FaUser /> : <FaRobot />}
            </div>

            {/* Message Bubble */}
            <div
              className={`flex-1 max-w-[75%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-1">
                {format(new Date(message.timestamp), 'h:mm a')}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <FaRobot className="text-gray-700" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 input-field"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Shield, AlertTriangle, RotateCcw } from 'lucide-react';
import { generateAIResponse } from '../../services/apiServices';
import ReactMarkdown from 'react-markdown';

const extractText = (node) => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) return extractText(node.props.children);
  return '';
};

const MessageBubble = ({ msg }) => {
  const isBot = msg.role === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 group animate-in fade-in slide-in-from-bottom-2`}>
      {isBot && (
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-2 shrink-0 shadow-md mt-0.5 border border-red-400 dark:border-red-700">
          <Shield className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`px-4 py-3 text-[14px] leading-relaxed relative ${
          isBot 
            ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/95 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-3xl rounded-bl-sm shadow-lg shadow-slate-200/50 dark:shadow-none' 
            : 'bg-gradient-to-br from-red-600 to-red-500 text-white rounded-3xl rounded-br-sm shadow-lg shadow-red-500/30'
        }`}>
          {isBot ? (
             <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-li:my-1 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0 prose-headings:text-red-700 dark:prose-headings:text-red-400 prose-headings:border-b prose-headings:border-red-100 dark:prose-headings:border-red-900/30 prose-headings:pb-1 prose-headings:uppercase prose-headings:tracking-wider prose-em:bg-yellow-100 dark:prose-em:bg-yellow-900/30 prose-em:px-1 prose-em:rounded prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-50 dark:prose-blockquote:bg-red-900/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:rounded-r-lg pb-1 max-w-none">
               <ReactMarkdown
                 components={{
                   strong: ({ children }) => {
                     const text = extractText(children).replace(/\s+/g, ' ').trim();
                     // Only render the "alert pill" for very short, high-signal fragments.
                     // If the model bolds whole sentences, we keep it as plain emphasis (no big highlight block).
                     const words = text.split(/\s+/).filter(Boolean);
                     const isPill =
                       text.length > 0 &&
                       text.length <= 24 &&
                       words.length <= 4 &&
                       !/[.!?]/.test(text) &&
                       !text.includes('\n');
                     return (
                       <strong
                         className={
                           isPill
                             ? 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded-md font-bold border border-red-200 dark:border-red-500/20'
                             : 'font-semibold text-red-700 dark:text-red-300'
                         }
                       >
                         {children}
                       </strong>
                     );
                   },
                 }}
               >
                 {msg.text}
               </ReactMarkdown>
             </div>
          ) : (
             <span className="whitespace-pre-wrap">{msg.text}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setHasUnread(false);
      setMessages([{ id: Date.now(), role: 'bot', text: "🚨 **ResQLink Emergency Assistant**\n\nHello! I am an AI trained in disaster response. Please state the nature of your emergency or ask me any question." }]);
    }
    if (isOpen) setHasUnread(false);
  }, [isOpen, messages.length]);

  const QUICK_REPLIES = [
    "🔥 Fire Protocol", 
    "🏥 First Aid Help", 
    "🌊 Flood Evacuation",
    "📞 Emergency Contacts"
  ];

  const sendUserMessage = async (text) => {
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    setIsTyping(true);

    // Gemini SDK requires history to strictly alternate and begin with 'user'. 
    // We omit the first auto-generated 'bot' welcome message to satisfy this.
    const history = messages.slice(1).map(m => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.text }] }));
    
    let reply = await generateAIResponse(text, history);
    
    // Parse dynamic suggestions
    let suggestions = null;
    const suggestionsMatch = reply.match(/\|\|\|(.*?)\|\|\|/s);
    if (suggestionsMatch && suggestionsMatch[1]) {
      try {
        suggestions = JSON.parse(suggestionsMatch[1]);
        reply = reply.replace(suggestionsMatch[0], '').trim();
      } catch (err) {
        console.error("Failed to parse AI suggestions", err);
      }
    }
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: reply, suggestions }]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    await sendUserMessage(inputText.trim());
  };

  const resetChat = () => {
    setMessages([{ id: Date.now(), role: 'bot', text: "🚨 **ResQLink Emergency Assistant**\n\nHello! I am an AI trained in disaster response. Please state the nature of your emergency or ask me any question." }]);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {hasUnread && !isOpen && (
          <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce border border-slate-700">
            💬 AI Emergency Coach
          </div>
        )}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'bg-slate-800 rotate-0' : 'bg-red-600 hover:bg-red-700 hover:scale-110'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[580px] h-[550px] bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4.5 h-4.5 text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">ResQLink Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Powered by Gemini</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors group/btn relative"
                title="Reset chat"
              >
                <RotateCcw className="w-4 h-4 text-slate-400 group-hover/btn:rotate-180 transition-transform duration-500" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors group/btn"
              >
                <X className="w-4 h-4 text-slate-400 group-hover/btn:text-red-400" />
              </button>
            </div>
          </div>

          <div className="bg-red-600 px-4 py-2 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-[11px] text-white font-bold tracking-wide">Life-threatening? Call <strong className="underline">112</strong> immediately</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && !isTyping && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 overflow-x-auto no-scrollbar flex gap-2">
              {(messages[messages.length - 1].suggestions || QUICK_REPLIES).map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendUserMessage(reply)}
                  className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600/50 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-md hover:-translate-y-0.5 hover:from-red-50 dark:hover:from-red-900/20 dark:hover:to-slate-800 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* New Input Bar replacing static options */}
          <div className="p-3 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask for advice or report an issue..."
                className="flex-1 bg-slate-100 dark:bg-slate-700 outline-none px-4 py-2.5 rounded-full text-sm font-medium border border-transparent focus:border-red-300 dark:focus:border-red-800 transition-all dark:text-dark-text"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 shrink-0 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors"
               >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

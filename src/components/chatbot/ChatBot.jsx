import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, AlertTriangle, Shield, Heart, Flame, Droplets, Package, ChevronRight, RotateCcw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

// ─── Helpline Database ───────────────────────────────────────────────────────
const HELPLINES = {
  national_emergency: { name: 'National Emergency', number: '112', desc: 'All emergencies (Police, Fire, Ambulance)', color: 'bg-red-600', textColor: 'text-red-600' },
  police: { name: 'Police', number: '100', desc: 'Law enforcement assistance', color: 'bg-blue-600', textColor: 'text-blue-600' },
  fire: { name: 'Fire Brigade', number: '101', desc: 'Fire emergencies & rescue', color: 'bg-orange-600', textColor: 'text-orange-600' },
  ambulance: { name: 'Ambulance', number: '102 / 108', desc: 'Medical emergencies', color: 'bg-green-600', textColor: 'text-green-600' },
  disaster: { name: 'NDRF Helpline', number: '0120-2430197', desc: 'National Disaster Response Force', color: 'bg-purple-600', textColor: 'text-purple-600' },
  women: { name: 'Women Helpline', number: '1091', desc: '24/7 women safety & distress', color: 'bg-pink-600', textColor: 'text-pink-600' },
  child: { name: 'Childline', number: '1098', desc: 'Child safety & protection', color: 'bg-yellow-600', textColor: 'text-yellow-600' },
  mental_health: { name: 'Mental Health (NIMHANS)', number: '080-46110007', desc: 'Psychological first aid & crisis', color: 'bg-teal-600', textColor: 'text-teal-600' },
  blood_bank: { name: 'Blood Bank', number: '1910', desc: 'Emergency blood supply coordination', color: 'bg-red-700', textColor: 'text-red-700' },
  poison: { name: 'Poison Control', number: '1800-116-117', desc: 'Toxicology & poisoning emergencies', color: 'bg-lime-700', textColor: 'text-lime-700' },
  railway: { name: 'Railway Helpline', number: '139', desc: 'Railway accident & emergency', color: 'bg-slate-600', textColor: 'text-slate-600' },
  road: { name: 'Road Accident', number: '1033', desc: 'Highway patrol & accident response', color: 'bg-amber-600', textColor: 'text-amber-600' },
};

// ─── Conversation Tree ────────────────────────────────────────────────────────
const CONVERSATION_TREE = {
  root: {
    id: 'root',
    botMessage: "🚨 **ResQLink Emergency Assistant**\n\nHello! I'm your emergency response guide. How can I assist you right now?",
    options: [
      { label: '🆘 I need emergency help NOW', next: 'emergency_now' },
      { label: '📋 Report an incident', next: 'report_incident' },
      { label: '📞 View helpline numbers', next: 'helplines_menu' },
      { label: '🗺️ Navigate the app', next: 'navigate_app' },
      { label: '💧 Find resources', next: 'resources' },
      { label: 'ℹ️ About ResQLink', next: 'about' },
    ]
  },
  emergency_now: {
    id: 'emergency_now',
    botMessage: "⚡ **IMMEDIATE HELP**\n\nWhat kind of emergency are you facing?",
    options: [
      { label: '🔥 Fire / Explosion', next: 'fire_help' },
      { label: '🏥 Medical Emergency', next: 'medical_help' },
      { label: '🌊 Flood / Natural Disaster', next: 'disaster_help' },
      { label: '🔫 Crime / Violence', next: 'crime_help' },
      { label: '⬅️ Go back', next: 'root' },
    ]
  },
  fire_help: {
    id: 'fire_help',
    botMessage: "🔥 **FIRE EMERGENCY PROTOCOL**\n\n1. **Evacuate immediately** — do not use elevators\n2. Alert everyone nearby\n3. Close doors to slow fire spread\n4. Call Fire Brigade below\n5. **Report the incident in ResQLink** so responders are notified",
    helplines: ['fire', 'national_emergency'],
    options: [
      { label: '📋 Report fire incident', action: 'report', nav: '/report' },
      { label: '📞 More helplines', next: 'helplines_menu' },
      { label: '🏠 Go to main menu', next: 'root' },
    ]
  },
  medical_help: {
    id: 'medical_help',
    botMessage: "🏥 **MEDICAL EMERGENCY PROTOCOL**\n\n1. Call ambulance immediately\n2. Do NOT move injured person unless in danger\n3. Keep them warm and calm\n4. Stay on the line with emergency services\n5. File a report to alert nearby response units",
    helplines: ['ambulance', 'national_emergency', 'blood_bank', 'poison'],
    options: [
      { label: '📋 Report medical incident', action: 'report', nav: '/report' },
      { label: '🧠 Mental health crisis', next: 'mental_health_help' },
      { label: '🏠 Go to main menu', next: 'root' },
    ]
  },
  mental_health_help: {
    id: 'mental_health_help',
    botMessage: "💙 **Mental Health & Crisis Support**\n\nYou are not alone. Immediate support is available 24/7.\n\n• Listen without judgment\n• Stay with the person in crisis\n• Contact crisis helpline immediately",
    helplines: ['mental_health', 'national_emergency'],
    options: [
      { label: '⬅️ Go back', next: 'medical_help' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  disaster_help: {
    id: 'disaster_help',
    botMessage: "🌊 **FLOOD/DISASTER PROTOCOL**\n\n1. Move to higher ground immediately\n2. Avoid flooded roads\n3. Do not touch electrical equipment if wet\n4. Contact NDRF for rescue operations\n5. Submit a ResQLink report to coordinate relief",
    helplines: ['disaster', 'national_emergency', 'railway'],
    options: [
      { label: '📋 Report disaster', action: 'report', nav: '/report' },
      { label: '🗺️ View crisis map', action: 'navigate', nav: '/map' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  crime_help: {
    id: 'crime_help',
    botMessage: "🔒 **CRIME / SAFETY PROTOCOL**\n\n1. **Move to a safe location first**\n2. Do not confront perpetrators\n3. Note vehicle numbers / descriptions\n4. Call police immediately\n5. For women — use Women Helpline for faster response",
    helplines: ['police', 'national_emergency', 'women'],
    options: [
      { label: '👩 Women safety help', next: 'women_help' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  women_help: {
    id: 'women_help',
    botMessage: "💜 **Women Safety Resources**\n\n24/7 dedicated support for women in distress. All calls are treated with strict confidentiality. Immediate police dispatch available.",
    helplines: ['women', 'police', 'national_emergency'],
    options: [
      { label: '👧 Child safety', next: 'child_help' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  child_help: {
    id: 'child_help',
    botMessage: "🧒 **Childline Support**\n\nSafe, confidential support for children and those concerned about a child's welfare. Available 24/7.",
    helplines: ['child', 'police', 'national_emergency'],
    options: [
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  report_incident: {
    id: 'report_incident',
    botMessage: "📋 **Submit an Emergency Report**\n\nFiling a report alerts the nearest response units and agencies. Here's what to include:\n\n• Type of emergency\n• Severity level\n• Your location (auto-detected)\n• Brief description\n\nReady to submit?",
    options: [
      { label: '✅ Yes, submit a report', action: 'navigate', nav: '/report' },
      { label: '📊 View existing incidents', action: 'navigate', nav: '/dashboard' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  helplines_menu: {
    id: 'helplines_menu',
    botMessage: "📞 **All Emergency Helplines (India)**\n\nSelect a category to view contact information:",
    options: [
      { label: '🚨 Core Emergency Numbers', next: 'helplines_core' },
      { label: '⚕️ Medical & Health', next: 'helplines_medical' },
      { label: '💪 Community Safety', next: 'helplines_safety' },
      { label: '🌧️ Disaster & Transport', next: 'helplines_disaster' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  helplines_core: {
    id: 'helplines_core',
    botMessage: "🚨 **Core Emergency Contacts**\n\nThese are your primary lifelines:",
    helplines: ['national_emergency', 'police', 'fire', 'ambulance'],
    options: [
      { label: '⬅️ Other categories', next: 'helplines_menu' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  helplines_medical: {
    id: 'helplines_medical',
    botMessage: "⚕️ **Medical & Health Helplines**",
    helplines: ['ambulance', 'blood_bank', 'poison', 'mental_health'],
    options: [
      { label: '⬅️ Other categories', next: 'helplines_menu' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  helplines_safety: {
    id: 'helplines_safety',
    botMessage: "💪 **Community Safety Helplines**",
    helplines: ['women', 'child', 'police'],
    options: [
      { label: '⬅️ Other categories', next: 'helplines_menu' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  helplines_disaster: {
    id: 'helplines_disaster',
    botMessage: "🌧️ **Disaster & Transport Helplines**",
    helplines: ['disaster', 'railway', 'road'],
    options: [
      { label: '⬅️ Other categories', next: 'helplines_menu' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  navigate_app: {
    id: 'navigate_app',
    botMessage: "🗺️ **App Navigation Guide**\n\nResQLink has the following sections. Where would you like to go?",
    options: [
      { label: '🏠 Dashboard (Command Center)', action: 'navigate', nav: '/dashboard' },
      { label: '🗺️ Crisis Map', action: 'navigate', nav: '/map' },
      { label: '📋 Submit Incident Report', action: 'navigate', nav: '/report' },
      { label: '📦 Resources & Units', action: 'navigate', nav: '/resources' },
      { label: '📊 Analytics', action: 'navigate', nav: '/analytics' },
      { label: '⚙️ Back to main menu', next: 'root' },
    ]
  },
  resources: {
    id: 'resources',
    botMessage: "📦 **Resource Information**\n\nResQLink tracks these resources in real-time:\n\n• 🚰 Water supplies (liters)\n• 🏥 Medical kits (units)\n• 🍱 Food packets\n• 🚑 Response units & volunteers\n\nView current availability on the Resources page.",
    options: [
      { label: '📦 View Resources', action: 'navigate', nav: '/resources' },
      { label: '🗺️ View on Map', action: 'navigate', nav: '/map' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
  about: {
    id: 'about',
    botMessage: "ℹ️ **About ResQLink**\n\nResQLink is a **real-time disaster response coordination platform** that connects:\n\n• 🏛️ **Agencies** — Command & coordinate response\n• 🙋 **Volunteers** — On-ground relief work\n• 👤 **Civilians** — Report emergencies & request help\n\nBuilt for rapid, life-saving coordination during crises.",
    options: [
      { label: '📋 Submit a Report', action: 'navigate', nav: '/report' },
      { label: '📞 Emergency Helplines', next: 'helplines_menu' },
      { label: '🏠 Main menu', next: 'root' },
    ]
  },
};

// ─── HelplinesCard Component ──────────────────────────────────────────────────
const HelplineCard = ({ helplineKey }) => {
  const h = HELPLINES[helplineKey];
  if (!h) return null;
  return (
    <a
      href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className={`w-10 h-10 ${h.color} rounded-full flex items-center justify-center shrink-0`}>
        <Phone className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm text-slate-800 truncate">{h.name}</span>
          <span className={`font-mono font-bold text-sm ${h.textColor} shrink-0`}>{h.number}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{h.desc}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
    </a>
  );
};

// ─── Message Renderer ─────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isBot = msg.role === 'bot';

  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5 shadow">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isBot 
            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm' 
            : 'bg-red-600 text-white rounded-tr-sm'
        }`}>
          {renderText(msg.text)}
        </div>
        {/* Helpline cards */}
        {msg.helplines && msg.helplines.length > 0 && (
          <div className="mt-2 space-y-2 w-full">
            {msg.helplines.map(k => <HelplineCard key={k} helplineKey={k} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main ChatBot Component ───────────────────────────────────────────────────
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState('root');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAppState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize chat on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setHasUnread(false);
      showBotMessage('root');
    }
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  const showBotMessage = (nodeId) => {
    const node = CONVERSATION_TREE[nodeId];
    if (!node) return;
    setCurrentNode(nodeId);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: node.botMessage,
        helplines: node.helplines || [],
        options: node.options || [],
        id: Date.now(),
      }]);
    }, 700);
  };

  const handleOptionClick = (option) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      text: option.label,
      id: Date.now(),
    }]);

    if (option.action === 'navigate' || option.action === 'report') {
      // Navigate and show confirmation
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `✅ Taking you to **${option.nav}** now. The page will open momentarily.`,
          helplines: [],
          options: [{ label: '🏠 Back to main menu', next: 'root' }],
          id: Date.now(),
        }]);
        navigate(option.nav);
      }, 500);
    } else if (option.next) {
      setTimeout(() => showBotMessage(option.next), 300);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentNode('root');
    setTimeout(() => showBotMessage('root'), 100);
  };

  const lastMessage = messages[messages.length - 1];
  const currentOptions = lastMessage?.role === 'bot' ? lastMessage.options : [];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce border border-slate-700">
            💬 Emergency Help
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

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[580px] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4.5 h-4.5 text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">ResQLink Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Online 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset chat"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="bg-red-600 px-4 py-2 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-[11px] text-white font-bold tracking-wide">Life-threatening? Call <strong className="underline">112</strong> immediately</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
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

          {/* Options / Quick Replies */}
          {currentOptions && currentOptions.length > 0 && !isTyping && (
            <div className="p-3 border-t border-slate-200 bg-white flex flex-col gap-1.5 shrink-0 max-h-52 overflow-y-auto">
              {currentOptions.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all flex items-center justify-between group font-medium text-slate-700"
                >
                  <span>{option.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;

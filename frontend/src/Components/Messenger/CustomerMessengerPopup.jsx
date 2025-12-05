import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Clock, User, ZoomIn } from 'lucide-react';
import api from '../../api';
import { useUser } from '../Context/UserContext';
import { getStorageUrl } from '../../utils/backendUrl';

const CustomerMessengerPopup = ({ 
  isOpen, 
  onClose
}) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const retryCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentUserId = async () => {
    // First try to get from UserContext (preferred)
    if (user && user.userID) {
      setCurrentUserId(user.userID);
      return user.userID;
    }
    
    // Fallback to localStorage
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userId = userData.userID || userData.id;
        setCurrentUserId(userId);
        return userId;
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
      }
    }
    
    // Last resort: API call
    try {
      const response = await api.get('/user');
      const userId = response.data.userID || response.data.id;
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getCurrentUserId();
      fetchAllConversations();
      retryCountRef.current = 0; // Reset retry counter when opening
    } else {
      // Reset when popup closes
      setNewMessage('');
      setMessageType('general');
      setConversationId(null);
      setSelectedConversation(null);
      setMessages([]);
      retryCountRef.current = 0; // Reset retry counter when closing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const fetchAllConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update current user ID when user context changes
  useEffect(() => {
    if (user && user.userID) {
      setCurrentUserId(user.userID);
    }
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;
    
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/chat/${conversationId}/messages`);
        const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
        setMessages(data);
      } catch (err) {
        // Only log errors that aren't network-related or are actual API errors
        if (err.response) {
          // This is an actual API error (4xx, 5xx) - only log if it's not a network issue
          if (err.response.status !== 0) {
            console.error("Failed to fetch messages:", err.response.status, err.response.data);
          }
        } else if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error' && !err.message.includes('ERR_INTERNET_DISCONNECTED')) {
          // Log other errors but not network disconnection errors
          console.error("Failed to fetch messages:", err.message);
        }
        // Silently handle network errors to avoid console spam
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const getFileType = (file) => {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf" || type.includes("document")) return "document";
    return "other";
  };

  // Map frontend message types to backend valid types
  const mapMessageType = (type) => {
    const validTypes = ['custom_request', 'order_update', 'damage_report', 'after_sale', 'general'];
    // Map 'product_customize' to 'custom_request' for backend
    if (type === 'product_customize') {
      return 'custom_request';
    }
    // Return the type if it's valid, otherwise default to 'general'
    return validTypes.includes(type) ? type : 'general';
  };

  const handleConversationClick = async (conv) => {
    if (!conv || !conv.conversation_id) {
      console.error('Invalid conversation selected');
      return;
    }
    
    retryCountRef.current = 0; // Reset retry counter when selecting a new conversation
    setConversationId(conv.conversation_id);
    setSelectedConversation(conv);
    setIsLoading(true);
    try {
      const response = await api.get(`/chat/${conv.conversation_id}/messages`);
      const data = Array.isArray(response.data) ? response.data : response.data.messages || [];
      setMessages(data);
    } catch (err) {
      // Only log actual API errors, not network disconnection errors
      if (err.response && err.response.status !== 0) {
        console.error("Failed to fetch messages:", err.response.status, err.response.data);
      } else if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error' && !err.message.includes('ERR_INTERNET_DISCONNECTED')) {
        console.error("Failed to fetch messages:", err.message);
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !file) return;
    if (!conversationId || isLoading) return;
    
    if (!selectedConversation) {
      console.error('No conversation selected, cannot send message');
      return;
    }

    // Get seller user ID from the conversation
    // Try multiple possible paths to get the userID
    const sellerUserId = selectedConversation.receiver?.userID 
      || selectedConversation.seller?.userID
      || selectedConversation.receiver_id
      || selectedConversation.seller_id;
    
    if (!sellerUserId) {
      console.error('sellerUserId is missing, cannot send message', {
        conversation: selectedConversation,
        receiver: selectedConversation.receiver,
        seller: selectedConversation.seller
      });
      
      // Try to fetch the conversation again to get updated data (only once)
      if (retryCountRef.current === 0) {
        retryCountRef.current = 1;
        try {
          const convResponse = await api.get('/chat/conversations');
          const updatedConv = convResponse.data?.find(c => c.conversation_id === conversationId);
          if (updatedConv) {
            const updatedSellerUserId = updatedConv.receiver?.userID || updatedConv.seller?.userID;
            if (updatedSellerUserId) {
              setSelectedConversation(updatedConv);
              // Retry sending the message
              setTimeout(() => {
                retryCountRef.current = 0;
                sendMessage();
              }, 100);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to refresh conversation:', err);
        }
        retryCountRef.current = 0;
      }
      return;
    }
    
    // Reset retry count on successful send
    retryCountRef.current = 0;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append("message_text", messageText);
    formData.append("message_type", mapMessageType(messageType));
    formData.append("receiver_id", sellerUserId);

    if (file) {
      try {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        
        const uploadResponse = await api.post(`/upload`, fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!uploadResponse.data || !uploadResponse.data.path) {
          throw new Error('Upload response missing path');
        }

        formData.append("attachments[0][file_url]", uploadResponse.data.path);
        formData.append("attachments[0][file_type]", getFileType(file));
      } catch (error) {
        console.error("File upload failed:", error);
        if (error.response) {
          console.error("Upload error response:", error.response.data);
        }
        setIsLoading(false);
        setFile(null);
        return;
      }
    }

    try {
      await api.post(`/chat/${conversationId}/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const response2 = await api.get(`/chat/${conversationId}/messages`);
      const updatedMessages = Array.isArray(response2.data) ? response2.data : response2.data.messages || [];
      setMessages(updatedMessages);
      setFile(null);
      
      // Refresh conversations to update latest message
      fetchAllConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Close image modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  if (!isOpen) return null;

  const sellerName = selectedConversation?.seller?.userName || selectedConversation?.receiver?.userName || 'Seller';
  const sellerAvatar = selectedConversation?.seller?.profilePicture || selectedConversation?.receiver?.profilePicture;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] w-[750px] h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-[#e5ded7] overflow-hidden flex flex-col"
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]">
            <h3 className="font-semibold text-white flex items-center text-sm">
              <MessageCircle className="h-3 w-3 mr-2" />
              <span className="truncate">My Chats ({conversations.length})</span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const latestMessage = conversation.messages?.[0];
                const isActive = conversation.conversation_id === conversationId;
                const convSellerName = conversation.seller?.userName || conversation.receiver?.userName || 'Seller';
                const convAvatar = conversation.seller?.profilePicture || conversation.receiver?.profilePicture;

                return (
                  <button
                    key={conversation.conversation_id}
                    onClick={() => handleConversationClick(conversation)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-[#f8f1ec] border-r-2 border-[#a4785a]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {convAvatar ? (
                          <img 
                            src={convAvatar.startsWith('http') ? convAvatar : getStorageUrl(convAvatar)} 
                            alt={convSellerName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium truncate text-gray-900`}>
                            {convSellerName}
                          </p>
                        </div>
                        
                        {latestMessage && (
                          <>
                            <p className="text-xs truncate mb-1 text-gray-500">
                              {latestMessage.message || '📎 Attachment'}
                            </p>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeAgo(latestMessage.created_at)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {sellerAvatar ? (
                <img 
                  src={sellerAvatar.startsWith('http') ? sellerAvatar : getStorageUrl(sellerAvatar)} 
                  alt={sellerName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{sellerName || 'Select a conversation'}</h3>
                {conversationId && (
                  <p className="text-xs text-white/80">Online</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-all duration-200 focus:outline-none flex-shrink-0"
            >
              <div className="hover:bg-white/20 rounded-full p-2 transition-all duration-200">
                <X className="h-5 w-5" />
              </div>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-[#faf9f8] to-white">
            {!conversationId ? (
              <div className="flex items-center justify-center h-full text-[#7b5a3b]">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-sm">No conversation selected. Choose a conversation from the left to start chatting</p>
                </div>
              </div>
            ) : isLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a4785a]"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#7b5a3b]">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  // Customer messages should appear on the right (blue bubble)
                  // Seller messages should appear on the left (gray bubble)
                  const messageSenderId = String(message.sender_id || '');
                  const currentUserIdStr = String(currentUserId || '');
                  const isCustomerMessage = currentUserId && messageSenderId === currentUserIdStr;

                  return (
                    <div
                      key={message.message_id}
                      className={`flex ${isCustomerMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCustomerMessage
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {/* Show message type badge for ALL messages (both customer and seller) */}
                        <div className="text-xs mb-1">
                          <span className={`px-2 py-0.5 rounded ${
                            isCustomerMessage 
                              ? "bg-white/20 text-white" 
                              : "bg-white text-[#7b5a3b]"
                          }`}>
                            {message.message_type || 'General'}
                          </span>
                        </div>
                        
                        {message.message && <p className="break-words text-sm font-medium">{message.message}</p>}
                        
                        {message.attachments && message.attachments.length > 0 && message.attachments.map((a, i) => {
                          const imageUrl = getStorageUrl(a.messageAttachment);
                          return (
                            <div key={i} className="mt-2">
                              {a.file_type === "image" ? (
                                <div className="relative group cursor-pointer" onClick={() => handleImageClick(imageUrl)}>
                                  <img 
                                    src={imageUrl} 
                                    alt="attachment" 
                                    className="max-w-full rounded-lg shadow max-h-64 object-contain transition-transform duration-200 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                  </div>
                                </div>
                              ) : (
                                <a 
                                  href={imageUrl}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs font-medium ${
                                    isCustomerMessage ? "text-white/90" : "text-blue-600"
                                  } hover:underline`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {a.file_type.toUpperCase()} Attachment
                                </a>
                              )}
                            </div>
                          );
                        })}
                        
                        <div className="text-xs mt-1 opacity-75 text-right">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          {conversationId && (
            <div className="flex flex-col gap-2 border-t border-[#e5ded7] pt-3 px-3 pb-3 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <select 
                  value={messageType} 
                  onChange={e => setMessageType(e.target.value)} 
                  className="border border-[#d5bfae] rounded-lg px-3 py-2 bg-white text-xs focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] text-[#5c3d28] outline-none"
                  disabled={!conversationId}
                >
                  <option value="general">General</option>
                  <option value="product_customize">Product Customize</option>
                  <option value="after_sale">After Sale</option>
                  <option value="order_update">Order</option>
                  <option value="damage_report">Damage</option>
                </select>

                {file && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f1ec] rounded-lg border border-[#e5ded7]">
                    <span className="text-xs truncate text-[#5c3d28]">{file.name}</span>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 border border-[#d5bfae] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] text-[#5c3d28] placeholder:text-[#7b5a3b]/50 outline-none"
                  disabled={isLoading || !conversationId}
                />

                <label className="cursor-pointer" title="Attach file">
                  <input
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    disabled={!conversationId}
                  />
                  <div className={`w-9 h-9 flex items-center justify-center border border-[#d5bfae] rounded-lg hover:bg-[#f8f1ec] text-lg transition-colors ${!conversationId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    📎
                  </div>
                </label>

                <button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !file) || isLoading || !conversationId}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-4 py-2 rounded-lg text-sm hover:from-[#8f674a] hover:to-[#6a4a32] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 pt-20"
          onClick={closeImageModal}
        >
          <div className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 hover:bg-black/70"
              aria-label="Close image viewer"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size view" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl mt-4"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMessengerPopup;


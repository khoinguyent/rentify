import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Send } from 'lucide-react';

interface TenantContactCardProps {
  tenant?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  propertyName: string;
}

export function TenantContactCard({ tenant, propertyName }: TenantContactCardProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement actual message sending logic
      console.log('Sending message:', { message, tenant, propertyName });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setMessage('');
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneCall = () => {
    if (tenant?.phone) {
      window.open(`tel:${tenant.phone}`);
    }
  };

  const handleEmail = () => {
    if (tenant?.email) {
      const subject = encodeURIComponent(`Inquiry about ${propertyName}`);
      window.open(`mailto:${tenant.email}?subject=${subject}`);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md p-6 md:p-8 overflow-hidden">
      {/* Teal accent border on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#5BA0A4] rounded-l-2xl" />
      
      <div className="ml-2">
        <h2 className="text-2xl font-semibold text-[#1E293B] mb-6">
          <span className="text-sm uppercase tracking-wider text-[#64748B] font-semibold">Contact Tenant</span>
        </h2>
      
      {tenant ? (
        <div className="space-y-6">
          {/* Tenant Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {tenant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-[#1E293B]">{tenant.name}</h3>
                <p className="text-sm text-[#64748B]">Current Tenant</p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3">
              {tenant.phone && (
                <button
                  onClick={handlePhoneCall}
                  className="w-full flex items-center gap-3 p-3 border border-[#E9F5F6] rounded-xl hover:bg-[#F3FAFA] transition-colors"
                >
                  <Phone size={20} className="text-[#5BA0A4]" />
                  <span className="text-[#1E293B] font-medium">{tenant.phone}</span>
                </button>
              )}

              {tenant.email && (
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center gap-3 p-3 border border-[#E9F5F6] rounded-xl hover:bg-[#F3FAFA] transition-colors"
                >
                  <Mail size={20} className="text-[#5BA0A4]" />
                  <span className="text-[#1E293B] font-medium">{tenant.email}</span>
                </button>
              )}
            </div>
          </div>

          {/* Message Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-500" />
              <h4 className="font-medium text-gray-900">Send Message</h4>
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${tenant.name}, I'm interested in learning more about ${propertyName}...`}
              className="w-full h-32 p-3 border border-[#E9F5F6] rounded-xl resize-none focus:ring-2 focus:ring-[#5BA0A4] focus:border-transparent text-[#1E293B]"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5BA0A4] text-white rounded-xl hover:bg-[#4a8e91] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
          <p className="text-gray-500">Contact details not available</p>
        </div>
      )}
      </div>
    </div>
  );
}

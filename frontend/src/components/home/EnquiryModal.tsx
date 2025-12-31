import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Phone, Mail, MapPin, Calendar, PhoneCall, ChevronDown, Check } from 'lucide-react';
import { enquiryAPI } from '../../services/api';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    city: '',
    state: '',
    postalCode: '',
    preferredContact: 'call', // 'meeting' or 'call'
    propertyInterest: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal/Zip code is required';
    if (!formData.propertyInterest) newErrors.propertyInterest = 'Property interest is required';

    // Validate phone number format (basic validation)
    if (formData.phoneNumber && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await enquiryAPI.submit(formData);
      if (response.success) {
        alert('Thank you for your enquiry! We will contact you soon.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: '',
          city: '',
          state: '',
          postalCode: '',
          preferredContact: 'call',
          propertyInterest: '',
        });
        onClose();
      } else {
        alert('Failed to submit enquiry. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[70]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 pt-24"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-8rem)] overflow-auto border border-gray-100 flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright px-6 py-5 rounded-t-2xl flex justify-between items-center shadow-lg z-10">
                <h2 className="text-2xl font-bold text-premium-navy">Property Enquiry</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-premium-navy hover:bg-white/30 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 bg-white flex-1 overflow-y-auto">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                          errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm mt-1 font-medium">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                          errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm mt-1 font-medium">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                        errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1 font-medium">{errors.phoneNumber}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="City"
                      />
                    </div>
                    {errors.city && <p className="text-red-500 text-sm mt-1 font-medium">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      State / Province *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                          errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="State / Province"
                      />
                    </div>
                    {errors.state && <p className="text-red-500 text-sm mt-1 font-medium">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Postal / Zip Code *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold" />
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 ${
                          errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Postal / Zip Code"
                      />
                    </div>
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1 font-medium">{errors.postalCode}</p>}
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    How would you like us to contact you?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.preferredContact === 'call'
                        ? 'border-premium-gold bg-gradient-to-br from-premium-gold/10 to-premium-gold-light/10 shadow-md'
                        : 'border-gray-300 hover:border-premium-gold/50 bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="call"
                        checked={formData.preferredContact === 'call'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <PhoneCall className={`h-5 w-5 mr-3 ${formData.preferredContact === 'call' ? 'text-premium-gold' : 'text-gray-600'}`} />
                      <span className={`font-medium ${formData.preferredContact === 'call' ? 'text-premium-navy' : 'text-gray-700'}`}>Expecting a Return Call</span>
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.preferredContact === 'meeting'
                        ? 'border-premium-gold bg-gradient-to-br from-premium-gold/10 to-premium-gold-light/10 shadow-md'
                        : 'border-gray-300 hover:border-premium-gold/50 bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="meeting"
                        checked={formData.preferredContact === 'meeting'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Calendar className={`h-5 w-5 mr-3 ${formData.preferredContact === 'meeting' ? 'text-premium-gold' : 'text-gray-600'}`} />
                      <span className={`font-medium ${formData.preferredContact === 'meeting' ? 'text-premium-navy' : 'text-gray-700'}`}>Schedule a Meeting</span>
                    </label>
                  </div>
                </div>

                {/* Property Interest */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    What kind of property are you interested in? *
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-premium-gold z-10 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-12 pr-10 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-premium-gold focus:border-premium-gold transition-all duration-200 font-medium text-gray-800 text-left flex items-center justify-between ${
                        errors.propertyInterest ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-premium-gold/50'
                      }`}
                    >
                      <span className={formData.propertyInterest ? 'text-gray-800' : 'text-gray-400'}>
                        {formData.propertyInterest || 'Select property type'}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-premium-gold transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl overflow-hidden"
                        >
                          {[
                            { value: 'Raw land', label: 'Raw land' },
                            { value: '3BHK', label: '3BHK' },
                            { value: '4BHK', label: '4BHK' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, propertyInterest: option.value }));
                                setIsDropdownOpen(false);
                                if (errors.propertyInterest) {
                                  setErrors(prev => ({ ...prev, propertyInterest: '' }));
                                }
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 ${
                                formData.propertyInterest === option.value
                                  ? 'bg-gradient-to-r from-premium-gold/10 to-premium-gold-light/10 text-premium-navy font-semibold'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span>{option.label}</span>
                              {formData.propertyInterest === option.value && (
                                <Check className="h-5 w-5 text-premium-gold" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.propertyInterest && <p className="text-red-500 text-sm mt-1 font-medium">{errors.propertyInterest}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright text-premium-navy py-3.5 px-6 rounded-xl font-bold hover:from-premium-gold-light hover:via-premium-gold-bright hover:to-premium-gold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-premium-navy"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Submit Enquiry</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnquiryModal;


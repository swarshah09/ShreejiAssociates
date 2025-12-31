import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Star, Eye, EyeOff } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  service: string;
  rating: number;
  content: string;
  showName: boolean;
}

interface NewTestimonial {
  name: string;
  role: string;
  service: string;
  rating: number;
  content: string;
  showName: boolean;
}

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: 'Kiran Desai',
      role: 'Client',
      service: '3BHK Apartment',
      rating: 5,
      content: 'Exceptional service and quality construction. Our dream home exceeded all expectations.',
      showName: true,
    },
    {
      id: 2,
      name: 'Anonymous Client',
      role: 'Client',
      service: '4BHK Villa',
      rating: 5,
      content: 'Outstanding experience from start to finish. The attention to detail was remarkable.',
      showName: false,
    },
  ]);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<NewTestimonial>({
    name: '',
    role: 'Client',
    service: '',
    rating: 5,
    content: '',
    showName: true,
  });

  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.content || !newTestimonial.service) {
      alert('Please fill in all required fields');
      return;
    }

    const testimonial = {
      id: Date.now(),
      ...newTestimonial,
    };

    setTestimonials([...testimonials, testimonial]);
    setNewTestimonial({
      name: '',
      role: 'Client',
      service: '',
      rating: 5,
      content: '',
      showName: true,
    });
    setShowAddForm(false);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial({ ...testimonial });
  };

  const handleUpdateTestimonial = () => {
    if (editingTestimonial) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
    }
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: number) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Testimonial Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              {renderStars(testimonial.rating)}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">"{testimonial.content}"</p>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {testimonial.showName ? testimonial.name : 'Anonymous'}
                </h4>
                {testimonial.showName ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {testimonial.role} • {testimonial.service}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditTestimonial(testimonial)}
                className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex-1"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteTestimonial(testimonial.id)}
                className="flex items-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Testimonial Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Testimonial</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.name}
                      onChange={(e) => setNewTestimonial({...newTestimonial, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter person's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={newTestimonial.role}
                      onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Client">Client</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Project *
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.service}
                      onChange={(e) => setNewTestimonial({...newTestimonial, service: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3BHK Apartment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={newTestimonial.rating}
                      onChange={(e) => setNewTestimonial({...newTestimonial, rating: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 Star</option>
                      <option value={2}>2 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={5}>5 Stars</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimonial Content *
                  </label>
                  <textarea
                    value={newTestimonial.content}
                    onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter the testimonial content..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showName"
                    checked={newTestimonial.showName}
                    onChange={(e) => setNewTestimonial({...newTestimonial, showName: e.target.checked})}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="showName" className="text-sm text-gray-700">
                    Display name publicly (uncheck for anonymous)
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddTestimonial}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Testimonial</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Testimonial Form */}
      {editingTestimonial && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Testimonial</h3>
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial.name}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editingTestimonial.role}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Client">Client</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Project
                    </label>
                    <input
                      type="text"
                      value={editingTestimonial.service}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, service: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={editingTestimonial.rating}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, rating: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 Star</option>
                      <option value={2}>2 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={5}>5 Stars</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimonial Content
                  </label>
                  <textarea
                    value={editingTestimonial.content}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editShowName"
                    checked={editingTestimonial.showName}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, showName: e.target.checked})}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="editShowName" className="text-sm text-gray-700">
                    Display name publicly (uncheck for anonymous)
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleUpdateTestimonial}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300"
                >
                  <Save className="h-5 w-5" />
                  <span>Update Testimonial</span>
                </button>
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TestimonialManagement;
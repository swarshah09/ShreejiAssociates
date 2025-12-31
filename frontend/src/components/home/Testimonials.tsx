import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonialsData = [
  {
    name: 'Kiran Desai',
    role: 'Client',
    service: '3BHK Apartment',
    rating: 5,
    content: 'Exceptional service and quality construction. Our dream home exceeded all expectations. The team was professional and delivered on time.',
    showName: true,
  },
  {
    name: 'Anonymous',
    role: 'Client',
    service: '4BHK Villa',
    rating: 5,
    content: 'Outstanding experience from start to finish. The attention to detail and customer service was remarkable. Highly recommend Shree Ji Associates.',
    showName: false,
  },
  {
    name: 'Mehul Shah',
    role: 'Employee',
    service: 'Project Management',
    rating: 5,
    content: 'Working with Shree Ji Associates has been incredibly rewarding. The company values quality and customer satisfaction above all.',
    showName: true,
  },
  {
    name: 'Ravi Patel',
    role: 'Client',
    service: '2BHK Apartment',
    rating: 5,
    content: 'Transparent pricing, quality materials, and timely delivery. Everything was handled professionally. Very satisfied with our new home.',
    showName: true,
  },
  {
    name: 'Anonymous',
    role: 'Client',
    service: '3BHK Villa',
    rating: 4,
    content: 'Great experience overall. The team was responsive and the construction quality is excellent. Minor delays but well worth the wait.',
    showName: false,
  },
  {
    name: 'Pooja Sharma',
    role: 'Employee',
    service: 'Architecture',
    rating: 5,
    content: 'Proud to be part of a company that prioritizes innovation and customer satisfaction. Great work environment and growth opportunities.',
    showName: true,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-premium-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-premium-navy mb-4 tracking-tight">
            What Our <span className="bg-gradient-to-r from-premium-gold via-premium-gold-light to-premium-gold-bright bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from our valued clients and team members who trust us with their dreams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 relative border border-gray-100 hover:border-premium-gold/30"
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-premium-gold/20" />
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? 'text-premium-gold fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                "{testimonial.content}"
              </p>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-premium-navy">
                  {testimonial.showName ? testimonial.name : 'Anonymous Client'}
                </h4>
                <p className="text-sm text-gray-600">
                  {testimonial.role} • {testimonial.service}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
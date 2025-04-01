import React, { useState } from 'react';
import { ArrowRight, Award, Sparkles, Rocket, Users } from 'lucide-react';
import { motion } from 'framer-motion'; // Added for animations
import heroImage from '../assets/ctr-ai-hero.png';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header with Mobile Menu */}
      <header className="bg-white dark:bg-gray-800 py-4 px-6 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              CTR.ai
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Login'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                {item}
              </a>
            ))}
            <a 
              href="/create" 
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Free
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-500 dark:text-gray-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 absolute w-full left-0 px-6 py-4"
          >
            {['Home', 'Login', 'Start Free'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </motion.nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-medium text-sm mb-4">
                <Award size={16} className="mr-2" />
                #1 AI Content Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Create <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">high-converting</span> content instantly
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                Boost engagement and grow your audience with AI-powered titles, hashtags, and descriptions optimized for performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/create" className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                  Start Free Trial <ArrowRight size={20} className="ml-2" />
                </a>
                <button className="px-8 py-3 text-lg font-semibold border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
              <div className="mt-6 flex items-center text-gray-500 dark:text-gray-400">
                <Users size={18} className="mr-2" />
                <span className="text-sm">Trusted by 50,000+ creators worldwide</span>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={heroImage}
                  alt="CTR.ai Dashboard Preview" 
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Why Choose CTR.ai?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles size={24} />,
                title: "AI-Powered Titles",
                desc: "Generate click-worthy titles backed by data-driven insights.",
                color: "indigo"
              },
              {
                icon: <Rocket size={24} />,
                title: "Smart Hashtags",
                desc: "Auto-generate trending hashtags for maximum reach.",
                color: "purple"
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-6-8a9 9 0 110 18 9 9 0 010-18z" />
                  </svg>
                ),
                title: "SEO Optimization",
                desc: "Craft descriptions that rank higher and convert better.",
                color: "blue"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900 text-${feature.color}-600 dark:text-${feature.color}-300 rounded-lg flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            What Our Users Say
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "CTR.ai doubled my engagement in just weeks!",
                author: "Sarah K., Content Creator",
                avatar: "https://via.placeholder.com/50"
              },
              {
                quote: "The best tool for growing my social presence.",
                author: "Mike R., Digital Marketer",
                avatar: "https://via.placeholder.com/50"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">{testimonial.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Skyrocket Your Content?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg opacity-90 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of creators and marketers transforming their content strategy with CTR.ai
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-3 text-lg font-semibold bg-white text-indigo-600 rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg">
              Start Free Trial
            </button>
            <button className="px-8 py-3 text-lg font-semibold border-2 border-white bg-transparent rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300">
              Contact Sales
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">CTR.ai</h3>
              <p className="text-sm">Empowering creators with AI-driven content tools.</p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Demo"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "Terms"]
              }
            ].map((section) => (
              <div key={section.title}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href={`#${link.toLowerCase()}`} className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">© 2025 CTR.ai. All rights reserved.</p>
            <div className="flex space-x-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a 
                  key={social}
                  href={`https://${social.toLowerCase()}.com`} 
                  className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Home, Rocket } from "lucide-react";
import { Link } from "react-router-dom"; // Assuming you're using React Router

const NotFound404 = () => {
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Sync dark mode with system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const rocketVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
    },
  };

  return (
    <div
      className={`min-h-screen font-sans ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      } flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full text-center"
      >
        {/* 404 Illustration */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            variants={rocketVariants}
            initial="initial"
            animate="animate"
            className="mx-auto"
          >
            <Rocket
              className={`w-24 h-24 ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            />
          </motion.div>
          <h1 className="text-8xl font-extrabold mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-semibold mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Looks like you've ventured into uncharted space. The page you're
            looking for doesn’t exist—or maybe it’s just hiding!
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg flex items-center justify-center shadow-md`}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle Warning */}
        <motion.div
          variants={itemVariants}
          className={`mt-8 flex items-center justify-center text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Error Code: 404 - Resource Not Found
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound404;
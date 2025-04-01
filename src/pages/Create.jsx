import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Rocket,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Settings,
  Zap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const Create = () => {
  const [input, setInput] = useState({
    topic: "",
    platform: "youtube",
    tone: "neutral",
    contentLength: "medium",
    targetAudience: "",
  });

  const [generated, setGenerated] = useState({
    titles: [],
    hashtags: [],
    description: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState({});
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  // For real-time suggestions (as user types)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);


  // Handle input change with real-time suggestion feature
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));

    // Only generate real-time suggestions for topic
    if (name === "topic" && value.length > 3) {
      setIsTyping(true);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to fetch suggestions after user stops typing
      setTypingTimeout(
        setTimeout(() => {
          if (value.length > 3) {
            fetchSuggestions(value);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
          setIsTyping(false);
        }, 500)
      );
    }
  };

  // Fetch topic suggestions in real-time
  const fetchSuggestions = async (topic) => {
    try {
      const prompt = `Suggest 3 related topics to "${topic}" for content creation. Format as plain topics, each on a new line. Keep it brief.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Suggestion error:", data.error);
        setSuggestions([]);
        return;
      }

      const text = data.candidates[0].content.parts[0].text;
      const suggestionsArray = text
        .split("\n")
        .filter((s) => s.trim() !== "")
        .slice(0, 3);

      setSuggestions(suggestionsArray);
      setShowSuggestions(suggestionsArray.length > 0);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    }
  };

  // Apply suggestion to input
  const applySuggestion = (suggestion) => {
    setInput((prev) => ({ ...prev, topic: suggestion }));
    setShowSuggestions(false);
  };

  // Generate content using Gemini API
  const handleGenerate = async () => {
    if (!input.topic) {
      setError("Please enter a topic!");
      return;
    }


    setIsGenerating(true);
    setGenerated({ titles: [], hashtags: [], description: "" });
    setError(null);

    try {
      const prompt = `Create engaging content for a ${
        input.platform
      } post about "${input.topic}" with a ${input.tone} tone, ${
        input.contentLength
      } length, targeted at ${input.targetAudience || "general audience"}.

      Generate:
      1. Three catchy titles (formatted as a JSON array)
      2. Five relevant hashtags (formatted as a JSON array)
      3. A compelling description (as a single string)

      Format the response as a JSON object with keys: titles, hashtags, description.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(
          `API Error: ${data.error.message || "Failed to generate content"}`
        );
        setIsGenerating(false);
        return;
      }

      if (!data.candidates || data.candidates.length === 0) {
        setError("No response from API. Please try again.");
        setIsGenerating(false);
        return;
      }

      // Parse the generated content
      const text = data.candidates[0].content.parts[0].text;
      let jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const contentJson = JSON.parse(jsonMatch[0]);
          setGenerated({
            titles: contentJson.titles || [],
            hashtags: contentJson.hashtags || [],
            description: contentJson.description || "",
          });
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          // Fallback to text processing if JSON parsing fails
          processFallbackResponse(text);
        }
      } else {
        processFallbackResponse(text);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Process response if JSON parsing fails
  const processFallbackResponse = (text) => {
    // Extract titles
    const titlesMatch = text.match(/titles?:?\s*\n*(.*\n.*\n.*)/i);
    const titles = titlesMatch
      ? titlesMatch[1]
          .split("\n")
          .map((t) => t.replace(/^[-*\d.)\s]+/, "").trim())
          .filter((t) => t)
      : [];

    // Extract hashtags
    const hashtagsMatch = text.match(
      /hashtags?:?\s*\n*((?:#[a-z0-9_]+(?:\s|,\s*|$)\n*)+)/i
    );
    const hashtags = hashtagsMatch
      ? hashtagsMatch[1].match(/#[a-z0-9_]+/gi) || []
      : [];

    // Extract description
    const descMatch = text.match(
      /description:?\s*\n*((?:(?!titles|hashtags).+\n*)+)/i
    );
    const description = descMatch ? descMatch[1].trim() : "";

    setGenerated({
      titles: titles.slice(0, 3),
      hashtags: hashtags.slice(0, 5),
      description: description,
    });
  };

  // Reset all inputs and outputs
  const handleReset = () => {
    setInput({
      topic: "",
      platform: "youtube",
      tone: "neutral",
      contentLength: "medium",
      targetAudience: "",
    });
    setGenerated({ titles: [], hashtags: [], description: "" });
    setError(null);
  };

  // Copy to clipboard
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Enter Gemini API Key
              </h2>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To use CTR.ai, you need a Gemini API key. Get one from the Google
              AI Studio.
            </p>
            <input
              type="password"
              value={import.meta.env.VITE_GEMINI_API_KEY}
              onChange={(e) => import.meta.env.VITE_GEMINI_API_KEY = e.target.value}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-tight mb-2"
          >
            CTR.ai Flash
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Generate high-converting content in real-time with Gemini AI
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Topic Input with Real-time Suggestions */}
            <div className="relative">
              <label
                htmlFor="topic"
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Lightbulb className="h-4 w-4 mr-2 text-indigo-500" />
                Topic
              </label>
              <div className="relative">
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  value={input.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Content creation tips for beginners"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                />
                {isTyping && (
                  <div className="absolute right-3 top-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-indigo-500"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Real-time suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600"
                  >
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-600"
                          >
                            {suggestion}
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="platform"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Rocket className="h-4 w-4 mr-2 text-indigo-500" />
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={input.platform}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tone"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={input.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                >
                  <option value="neutral">Neutral</option>
                  <option value="funny">Funny</option>
                  <option value="professional">Professional</option>
                  <option value="exciting">Exciting</option>
                  <option value="casual">Casual</option>
                  <option value="informative">Informative</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none transition-colors"
              >
                <Settings className="h-4 w-4 mr-1" />
                Advanced Options
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <label
                        htmlFor="contentLength"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Content Length
                      </label>
                      <select
                        id="contentLength"
                        name="contentLength"
                        value={input.contentLength}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="targetAudience"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Target Audience
                      </label>
                      <input
                        id="targetAudience"
                        name="targetAudience"
                        type="text"
                        value={input.targetAudience}
                        onChange={handleInputChange}
                        placeholder="e.g., Marketing professionals"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate Flash Content
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 flex items-center justify-center"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </motion.button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Output Section */}
        <AnimatePresence>
          {generated.titles.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 text-center">
                Your Generated Content
              </h2>

              {/* Titles */}
              <motion.div variants={staggerVariants} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
                  Catchy Titles
                </h3>
                <div className="space-y-3">
                  {generated.titles.map((title, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-indigo-100 dark:border-gray-600"
                    >
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {title}
                      </p>
                      <button
                        onClick={() => handleCopy(title, `title-${index}`)}
                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
                        aria-label="Copy title"
                      >
                        {copied[`title-${index}`] ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Hashtags */}
              <motion.div variants={staggerVariants} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <Rocket className="h-5 w-5 mr-2 text-purple-500" />
                  Trending Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generated.hashtags.map((hashtag, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="group relative"
                    >
                      <span className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
                        {hashtag}
                      </span>
                      <button
                        onClick={() => handleCopy(hashtag, `hashtag-${index}`)}
                        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 transition-opacity"
                        aria-label="Copy hashtag"
                      >
                        {copied[`hashtag-${index}`] ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div variants={staggerVariants}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Engaging Description
                </h3>
                <motion.div
                  variants={itemVariants}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 relative"
                >
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {generated.description}
                  </p>
                  <button
                    onClick={() =>
                      handleCopy(generated.description, "description")
                    }
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
                    aria-label="Copy description"
                  >
                    {copied["description"] ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </motion.div>
              </motion.div>

              {/* Export Options */}
              <motion.div
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Export Options
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const content = `
# Generated Content from CTR.ai Flash

## Topic: ${input.topic}
## Platform: ${input.platform}
## Tone: ${input.tone}

### Titles
${generated.titles.map((title) => `- ${title}`).join("\n")}

### Hashtags
${generated.hashtags.join(" ")}

### Description
${generated.description}
                      `;
                      handleCopy(content, "all-content");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied["all-content"] ? "Copied!" : "Copy All"}
                  </button>

                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const content = `
# Generated Content from CTR.ai Flash

## Topic: ${input.topic}
## Platform: ${input.platform}
## Tone: ${input.tone}

### Titles
${generated.titles.map((title) => `- ${title}`).join("\n")}

### Hashtags
${generated.hashtags.join(" ")}

### Description
${generated.description}
                      `;
                      const file = new Blob([content], { type: "text/plain" });
                      element.href = URL.createObjectURL(file);
                      element.download = `ctr-ai-content-${new Date()
                        .toISOString()
                        .slice(0, 10)}.md`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg flex items-center transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download as Text
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            CTR.ai Flash {new Date().getFullYear()} • Powered by Gemini •
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Update API Key
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Create;

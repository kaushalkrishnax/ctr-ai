import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Rocket,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const Home = () => {
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

  // Real-time suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Handle input change with real-time suggestions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));

    if (name === "topic" && value.length > 3) {
      setIsTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(
        setTimeout(() => {
          fetchSuggestions(value);
          setIsTyping(false);
        }, 500)
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch topic suggestions
  const fetchSuggestions = async (topic) => {
    try {
      const prompt = `Suggest 3 related topics to "${topic}" for content creation. Format as plain topics, each on a new line.`;
      const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.candidates[0].content.parts[0].text;
      const suggestionsArray = text.split("\n").filter((s) => s.trim()).slice(0, 3);
      setSuggestions(suggestionsArray);
      setShowSuggestions(suggestionsArray.length > 0);
    } catch (error) {
      console.error("Suggestions error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion) => {
    setInput((prev) => ({ ...prev, topic: suggestion }));
    setShowSuggestions(false);
  };

  // Generate content
  const handleGenerate = async () => {
    if (!input.topic) {
      setError("Please enter a topic!");
      return;
    }
    setIsGenerating(true);
    setGenerated({ titles: [], hashtags: [], description: "" });
    setError(null);

    try {
      const prompt = `Create engaging content for a ${input.platform} post about "${
        input.topic
      }" with a ${input.tone} tone, ${input.contentLength} length, targeted at ${
        input.targetAudience || "general audience"
      }. Generate: 1. Three catchy titles (JSON array) 2. Five relevant hashtags (JSON array) 3. A compelling description (string). Format as JSON with keys: titles, hashtags, description.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const contentJson = JSON.parse(jsonMatch[0]);
        setGenerated({
          titles: contentJson.titles || [],
          hashtags: contentJson.hashtags || [],
          description: contentJson.description || "",
        });
      } else {
        processFallbackResponse(text);
      }
    } catch (error) {
      setError(`Failed to generate: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback response processing
  const processFallbackResponse = (text) => {
    const titles = (text.match(/titles?:?\s*\n*(.*\n.*\n.*)/i)?.[1] || "")
      .split("\n")
      .map((t) => t.replace(/^[-*\d.)\s]+/, "").trim())
      .filter((t) => t)
      .slice(0, 3);
    const hashtags = (text.match(/hashtags?:?\s*\n*((?:#[a-z0-9_]+(?:\s|,\s*|$)\n*)+)/i)?.[1] || "")
      .match(/#[a-z0-9_]+/gi)?.slice(0, 5) || [];
    const description = text.match(/description:?\s*\n*((?:(?!titles|hashtags).+\n*)+)/i)?.[1].trim() || "";
    setGenerated({ titles, hashtags, description });
  };

  // Reset inputs
  const handleReset = () => {
    setInput({ topic: "", platform: "youtube", tone: "neutral", contentLength: "medium", targetAudience: "" });
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
  const containerVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };
  const staggerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
        {/* Intro Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-tight"
          >
            Welcome to<img src="/favicon.svg" alt="CTR.ai" className="inline-block w-16 h-16 ml-4" />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Instantly create high-converting content for any platform using Gemini AI. Enter a topic, tweak your preferences, and watch the magic happen!
          </motion.p>
        </div>

        {/* Main Content */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <div className="space-y-6">
            {/* Topic Input */}
            <div className="relative">
              <label htmlFor="topic" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lightbulb className="h-4 w-4 mr-2 text-indigo-500" />
                Topic
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                value={input.topic}
                onChange={handleInputChange}
                placeholder="e.g., Content creation tips"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {isTyping && (
                <div className="absolute right-3 top-9">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </motion.div>
                </div>
              )}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="px-4 py-2 absolute right-2 top-2">
                      <X className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => setShowSuggestions(false)} />
                    </div>
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <motion.li key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
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

            {/* Platform and Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Rocket className="h-4 w-4 mr-2 text-indigo-500" />
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={input.platform}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label htmlFor="tone" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={input.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Advanced Options
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label htmlFor="contentLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Length
                    </label>
                    <select
                      id="contentLength"
                      name="contentLength"
                      value={input.contentLength}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <input
                      id="targetAudience"
                      name="targetAudience"
                      type="text"
                      value={input.targetAudience}
                      onChange={handleInputChange}
                      placeholder="e.g., Marketing pros"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate Now
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg"
              >
                <RotateCcw className="h-5 w-5 mr-2 inline" />
                Reset
              </motion.button>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </motion.div>
            )}
          </div>

          {/* Generated Content */}
          <AnimatePresence>
            {generated.titles.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerVariants}
                className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 text-center">Generated Content</h2>
                {/* Titles */}
                <motion.div variants={staggerVariants} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                    <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
                    Titles
                  </h3>
                  <div className="space-y-3">
                    {generated.titles.map((title, index) => (
                      <motion.div key={index} variants={itemVariants} className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200">{title}</p>
                        <button
                          onClick={() => handleCopy(title, `title-${index}`)}
                          className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-700 rounded-full shadow-sm"
                        >
                          {copied[`title-${index}`] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Hashtags */}
                <motion.div variants={staggerVariants} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                    <Rocket className="h-5 w-5 mr-2 text-purple-500" />
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {generated.hashtags.map((hashtag, index) => (
                      <motion.span
                        key={index}
                        variants={itemVariants}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center"
                      >
                        {hashtag}
                        <button
                          onClick={() => handleCopy(hashtag, `hashtag-${index}`)}
                          className="ml-2 p-1 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          {copied[`hashtag-${index}`] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div variants={staggerVariants}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Description
                  </h3>
                  <motion.div variants={itemVariants} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg relative">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{generated.description}</p>
                    <button
                      onClick={() => handleCopy(generated.description, "description")}
                      className="absolute top-2 right-2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-700 rounded-full shadow-sm"
                    >
                      {copied["description"] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </motion.div>
                </motion.div>

                {/* Export */}
                <motion.div variants={itemVariants} className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      const content = `# CTR.ai Flash Content\n\nTopic: ${input.topic}\nPlatform: ${input.platform}\nTone: ${input.tone}\n\n### Titles\n${generated.titles
                        .map((t) => `- ${t}`)
                        .join("\n")}\n\n### Hashtags\n${generated.hashtags.join(" ")}\n\n### Description\n${generated.description}`;
                      handleCopy(content, "all");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied["all"] ? "Copied!" : "Copy All"}
                  </button>
                  <button
                    onClick={() => {
                      const content = `# CTR.ai Flash Content\n\nTopic: ${input.topic}\nPlatform: ${input.platform}\nTone: ${input.tone}\n\n### Titles\n${generated.titles
                        .map((t) => `- ${t}`)
                        .join("\n")}\n\n### Hashtags\n${generated.hashtags.join(" ")}\n\n### Description\n${generated.description}`;
                      const blob = new Blob([content], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `content-${new Date().toISOString().slice(0, 10)}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          CTR.ai {new Date().getFullYear()} • Powered by Gemini AI
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Placeholder component for Voice Input
const VoiceInput = ({ onTranscript }: { onTranscript: (transcript: string) => void }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError('Speech Recognition API not supported in this browser.');
      return;
    }

    if (!isListening) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={toggleListening}
        disabled={!!error}
        className={`px-4 py-2 rounded-full ${
          isListening ? 'bg-red-500' : error ? 'bg-gray-500' : 'bg-blue-500'
        } text-white transition-colors disabled:cursor-not-allowed`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Placeholder component for Text Chat
const ChatBox = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Send
      </button>
    </form>
  );
};

// Placeholder component for Image Uploader
const ImageUploader = ({ onImageUpload }: { onImageUpload: (data: { file: File; preview: string }) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    if (file.size > 1_000_000) {
      setError('Image too large. Please upload an image under 1MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageUpload({ file, preview: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed p-4 rounded-lg dark:border-gray-600 ${
        isDragging ? 'bg-blue-100 dark:bg-blue-900' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="w-full text-gray-700 dark:text-gray-300"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
        Drag and drop an image here or click to upload
      </p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

// Placeholder component for Assistant Response
const AssistantResponse = ({ messages }: { messages: { role: string; content: string; image?: string }[] }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg max-w-md animate-fade-in ${
            msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          {msg.role === 'user' && msg.image ? (
            <div>
              <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-2" />
              <span>{msg.content}</span>
            </div>
          ) : msg.role === 'assistant' ? (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Main page component
export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextMessage = async (message: string) => {
    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error('Error processing text:', error);
      setError(error.message);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    handleTextMessage(transcript);
  };

  const handleImageUpload = async ({ file, preview }: { file: File; preview: string }) => {
    const userMessage = { role: 'user', content: `Uploaded image`, image: preview };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.description }]);
    } catch (error: any) {
      console.error('Error processing image:', error);
      setError(`Failed to process image: ${error.message}`);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col max-w-3xl mx-auto p-4 w-full">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">
        AI-Powered Multimodal Assistant
      </h1>
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
      <AssistantResponse messages={messages} />
      {isLoading && (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      )}
      <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900 p-4 space-y-4">
        <VoiceInput onTranscript={handleVoiceTranscript} />
        <ImageUploader onImageUpload={handleImageUpload} />
        <ChatBox onSendMessage={handleTextMessage} />
      </div>
    </main>
  );
}
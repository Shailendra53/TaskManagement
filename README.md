# 📝 Task Management App

A modern, mobile-friendly task management application with voice input capabilities. Built for quick note-taking when you're on the go.

## ✨ Features

### Core Features
- 🎤 **Voice Input**: Add tasks using voice recognition (Web Speech API)
- 📱 **Mobile-First Design**: Responsive layout optimized for mobile devices
- 💾 **Offline Storage**: All data stored locally using IndexedDB
- 🏷️ **Categories**: Organize tasks into custom categories
- 📦 **Archive System**: Completed tasks are archived (not deleted) for future reference
- ⚡ **Real-time Updates**: Tasks sorted by creation date (latest first)
- 🎨 **Modern UI**: Clean interface with Tailwind CSS

### Task Management
- Add tasks via voice or text input
- Mark tasks as completed
- Delete tasks permanently
- View archived tasks
- Filter by category

### Categories
- Create custom categories with auto-assigned colors
- Filter tasks by category
- Delete categories
- View all tasks across categories

## 🛠️ Tech Stack

- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Storage**: IndexedDB (browser-native)
- **Voice Input**: Web Speech API
- **State Management**: React Hooks

## 🚀 Getting Started

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open your browser and navigate to `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## 📱 Browser Compatibility

### Voice Input Support
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 14.5+)
- ❌ Firefox (not yet supported)

## 💡 Usage

### Adding Tasks
1. **Text Input**: Type your task and click "Add Task"
2. **Voice Input**: Click "🎤 Voice Input" and speak

### Managing Tasks
- **Complete**: Click ✓ to archive
- **Delete**: Click × to delete permanently
- **View Archived**: Toggle archived tasks view

## 🔒 Privacy
- All data stored locally in your browser
- No server or backend
- Your data never leaves your device

## 📝 License
MIT License

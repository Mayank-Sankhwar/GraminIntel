# 🌾 AI Farming Assistant – Multimodal RAG-Powered AI Agent

A multilingual, multimodal AI Agent for farmers that combines Retrieval-Augmented Generation (RAG), voice interaction, real-time market prices, and live web intelligence to deliver accurate, personalized agricultural guidance.

## 📌 Overview

AI Farming Assistant is a production-oriented AI system enabling farmers to interact through:

*   **📞 Voice Calls**
*   **💬 WhatsApp Chat**
*   **🖼️ Image-Based Queries** (Pesticides / Crop Issues)

The platform integrates:

*   ✔ Domain-specific agricultural knowledge (RAG)
*   ✔ Live subsidies & scheme discovery
*   ✔ Real-time crop market prices
*   ✔ AI-initiated voice calls
*   ✔ Accessibility & disability support
*   ✔ Persistent personalization & memory

---

## ✨ Key Capabilities

### 🤖 Intelligent AI Agent
*   Conversational, task-aware AI built for real farming scenarios.
*   Contextual responses using memory & retrieved knowledge.
*   Seamless switch between text, voice, and images.

### 📚 RAG-Powered Knowledge Base
*   Farming-specific curated knowledge.
*   Augmented with scraped agricultural data.
*   Grounded answers with reduced hallucinations.

### 🧰 Dynamic Tool-Calling System
The AI Agent invokes tools based on user intent:

| Use Case | Tool |
| :--- | :--- |
| Latest subsidies / schemes | 🌐 Tavily Web Search & Scraping |
| Crop / commodity prices | 📈 MarketPrice Tool |
| Call request / outbound AI call | 📞 Twilio Call Tool |
| Farming knowledge queries | 📚 RAG Retrieval |

### 🖼️ Multimodal Image Understanding
*   Farmers upload pesticide or crop images.
*   AI performs visual reasoning.
*   Generates practical treatment guidance.

### 📞 AI-Initiated Voice Calls
*   Farmers request calls directly from WhatsApp.
*   AI triggers automated call flow.
*   Fully conversational voice experience.

### 🧾 Post-Call Intelligence & Summaries
After each call:
*   ✔ Conversation summary generated.
*   ✔ Delivered via WhatsApp + SMS.
*   ✔ Useful farmer information extracted.
*   ✔ Stored for personalization.

### 🌍 Multilingual & Inclusive Design
*   Supports multiple languages.
*   Accessibility-focused interaction patterns.
*   Designed for diverse literacy & ability levels.

---

## 🏗️ System Architecture

```text
Farmer (Voice / WhatsApp / Images)
                |
                v
           AI Agent Core
                |
     ┌──────────┼──────────┐
     v          v          v
   RAG       Tavily    MarketPrice
(Knowledge) (Web Data)  (Live Prices)
                |
                v
         Response Engine
                |
                v
    WhatsApp / Voice / SMS
```

---

## 🔄 Interaction Modes

### 💬 WhatsApp Interaction
*   Ask farming & crop questions.
*   Request latest schemes & subsidies.
*   Upload images for issue diagnosis.
*   Trigger AI voice calls.

### 📞 Voice Call Interaction
*   Natural conversational AI.
*   Farmer-friendly dialogue design.
*   Low-friction usability.

### 🖼️ Image-Based Queries
*   Upload pesticide / crop images.
*   AI analyzes symptoms visually.
*   Returns actionable advice.

---

## 🧬 RAG Knowledge Flow

```text
Farmer Query
      ↓
Intent + Context Detection
      ↓
Semantic Retrieval
      ↓
Knowledge Grounding
      ↓
LLM Response Generation
```

*   ✔ Domain-aware reasoning
*   ✔ Contextual accuracy
*   ✔ Knowledge-grounded outputs

---

## 🧠 Personalization Engine

The system continuously improves using interaction data:
*   ✔ Extracts farmer-specific insights.
*   ✔ Stores conversational context.
*   ✔ Delivers smarter future responses.

**Benefits:**
*   Personalized recommendations.
*   Context-aware assistance.
*   Improved accuracy over time.

---

## 🛠️ Tech Stack

### 🧠 AI & Intelligence
*   LLM-Driven Agent Framework
*   Retrieval-Augmented Generation (RAG)
*   Tool-Calling Orchestration

### 🌐 Live Intelligence & Data
*   Tavily Search & Scraping
*   MarketPrice Data Source

### ☁️ Communication Layer
*   Twilio (Voice Calls)
*   WhatsApp Integration
*   SMS Notifications

### 🖼️ Multimodal Processing
*   Image Query Understanding
*   Visual Reasoning Pipeline
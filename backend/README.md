# Sahaay AI

> **Empowering the Backbone of the Nation:** A durable, voice-first AI agent providing farmers with real-time agricultural intelligence and government scheme access over a simple phone call.

<div align="center">
  <img src="https://capsule-render.vercel.app/render?type=soft&color=auto&height=250&section=header&text=Sahaay%20AI&fontSize=90&animation=fadeIn&fontAlignY=38" width="100%" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Orchestration-Inngest_Durable_Functions-6E40C9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Interface-Voice_Call_24/7-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Agentic_RAG-orange?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-the-vision">Vision</a> •
  <a href="#-technical-architecture">Architecture</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-personalization-engine">Personalization</a>
</p>

---

## 🌾 The Vision
Digital literacy and internet connectivity should not be barriers to progress. **Sahaay AI** bridges the gap by turning the vast web of agricultural data into a **natural conversation**. By utilizing a phone-call-based interface, we ensure that even farmers with low-end feature phones can access real-time web intelligence.

---

## 🏗️ Technical Architecture

Sahaay AI is built on a **Durable Agentic Workflow** using Inngest. This ensures that multi-step processes like scraping, indexing, and telephony triggers never fail due to network timeouts.

### 🧩 The Intelligence Pipeline
1.  **Trigger:** A farmer initiates a call via **Twilio**.
2.  **Autonomous Scrape & Index:** The agent checks for local context. If missing, it performs a real-time scrape of government portals, chunks the data, and stores **Vector Embeddings** in MongoDB Atlas to avoid redundant future scrapes.
3.  **Real-Time Dialogue:** The agent delivers the answer via high-fidelity voice and handles complex follow-up questions.
4.  **Post-Call Synthesis:** Once the call ends, a background Inngest job extracts personal data (land size, eligible schemes, crop types) from the conversation to update the farmer's profile.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | **Accessibility Dashboard:** A high-contrast, font-adjustable UI designed for elderly and disabled users to monitor their queries. |
| **Telephony** | ![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=flat&logo=twilio&logoColor=white) | **Voice Gateway:** Initiating outbound calls to farmers and handling real-time duplex audio for the AI conversation. |
| **Search Engine** | ![Tavily](https://img.shields.io/badge/Tavily_Search-FF5733?style=flat) | **Agentic Web Search:** Specialized AI-scraping to fetch verified government schemes and crop data from across the web. |
| **Workflows** | ![Inngest](https://img.shields.io/badge/Inngest-000000?style=flat&logo=inngest&logoColor=white) | **Durable Orchestration:** Ensuring the multi-step process (Search → Index → Call) completes even if network timeouts occur. |
| **Intelligence** | ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=flat&logo=google&logoColor=white) | **LLM Core:** Powering the voice dialogue, intent detection, and post-call data extraction from conversations. |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) | **Memory Layer:** Storing vector embeddings for indexed websites and relational data for personalized farmer profiles. |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | **Logic Layer:** Managing API routes, webhooks for Twilio, and data transformation for the Inngest functions. |

## ⚙️ System Flow

```mermaid
graph TD
    %% User Interaction
    F[👨‍🌾 Farmer] -->|Voice Call| TW[Twilio Voice API]
    TW -->|Webhook| ING[Inngest Workflow]

    subgraph "Durable Intelligence Core"
        ING -->|1. Context Check| VDB{Vector DB Index}
        VDB -->|Cache Miss| SCR[Web Scraper / Tavily]
        SCR -->|Recursive Indexing| VDB
        VDB -->|Hit| AGT[AI Agent / Gemini]
    end

    subgraph "The Response Loop"
        AGT -->|Natural Voice| TW
        TW -->|Follow-up Interaction| F
    end

    subgraph "Post-Call Personalization"
        F -->|Hang up| JOB[Inngest Background Job]
        JOB -->|LLM Extraction| MDB[(Farmer Profile DB)]
        MDB -->|Pre-load Context| AGT
    end

    style ING fill:#6E40C9,color:#fff
    style AGT fill:#f96,stroke:#333,stroke-width:2px
    style MDB fill:#4ea,stroke:#333,stroke-width:2px

# NyayaSahayak (न्यायसहायक) - AI Legal Information & Case Preparation Assistant

An intelligent legal awareness, statutory RAG, and case preparation platform grounded in Indian Law, featuring the reformed criminal statutes (Bharatiya Nyaya Sanhita 2023, Bharatiya Nagarik Suraksha Sanhita 2023, Bharatiya Sakshya Adhiniyam 2023) alongside civil, labor, consumer, tenancy, and cyber legislation.

---

## ⚡ Running Locally vs in Google AI Studio

### Why did localhost give static responses before?
1. **In Google AI Studio**: The platform automatically injects your `GEMINI_API_KEY` into `process.env`. Gemini AI models generate dynamic, custom responses tailored to every user question.
2. **On Localhost**: When you clone or pull code to your local machine, `.env` files are not part of git for security reasons. Without `GEMINI_API_KEY`, the server automatically transitioned to the built-in Indian Statutory RAG engine.
3. **The Fix**:
   - The local Statutory RAG engine has been enhanced to produce diverse, statute-specific answers, custom questions, tailored evidence lists, and specific next steps for every different query.
   - You can easily connect your own Gemini API key on localhost for full AI reasoning!

---

## 🚀 Quick Setup on Localhost

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Your Gemini API Key
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY="AIzaSy_YOUR_API_KEY_HERE"
```
> **Tip:** You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com).

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ Dual-Engine Architecture

| Mode | Trigger | Features |
|---|---|---|
| **Gemini AI Engine** | `GEMINI_API_KEY` present | Dynamic LLM reasoning, multilingual legal translation (Hindi, Tamil, Telugu, etc.), customized advice synthesis. |
| **Local Statutory RAG Engine** | `GEMINI_API_KEY` missing or offline | BM25 + dense statutory retrieval across BNS, BNSS, BSA, CPA 2019, IT Act, Model Tenancy Act, Payment of Wages Act, NI Act 138, and PWDVA. |

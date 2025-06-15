# KBook - AI Book Maker

KBook is an innovative web application powered by the Google Gemini API, designed to assist users in creating complete books. From generating a comprehensive outline and a captivating title to writing individual chapters, KBook streamlines the book creation process with advanced AI capabilities.

## Features

-   **AI-Powered Book Outline Generation**: Provide a subject, language, desired number of chapters, and additional instructions to get a structured book outline in JSON format.
-   **AI-Powered Book Title Generation**: Generates an attractive and relevant book title (7-25 words) based on the subject and the generated outline.
-   **Automated & Streamed Chapter Content**:
    -   **Streaming Output**: Watch chapters being written in real-time.
    -   **Automated Generation**: Chapters are generated sequentially without manual intervention for each section.
    -   **Contextual Writing**: The AI considers the full book structure and previously written chapters for better coherence.
-   **Rich Customization Options**:
    -   **Language**: Select from multiple languages for book generation.
    -   **Generation Mode**:
        -   `Normal Mode` (uses `gemini-2.5-flash-preview-05-20`): Faster generation, good quality.
        -   `Advanced Mode` (uses `gemini-2.5-pro-preview-06-05`): Slower, potentially higher quality for more nuanced content.
    -   **Number of Chapters**: Specify the desired number of chapters (minimum 12).
    -   **Chapter Length**: Choose from presets (Short, Medium, Long) or fine-tune the approximate word count using a slider and direct input (default: 7000 words).
    -   **Reading Level**: Select from descriptive levels (e.g., Kindergarten, Middle School, Standard, High School, College, Graduate School) or customize on a 1-10 numerical scale.
-   **Interactive UI & Workflow**:
    -   **Step-by-Step Process**: Guided workflow from initial input to final book view.
    -   **Progress Bar**: Visually track your progress through the book creation stages.
    -   **Outline Review**: Review and approve the generated title and structure before proceeding.
    -   **Chapter Generation View**: Monitor the automated writing process with per-chapter status and streamed content.
-   **Export Options**:
    -   **Copy to Clipboard**: Copy the entire book (title + chapters) in Markdown format.
    -   **Download .txt**: Download the book as a plain text file, with content formatted in Markdown.
-   **Responsive Design**: User-friendly interface accessible on various devices.
-   **Error Handling**: Provides feedback for API key issues or generation errors.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI**: Google Gemini API (`@google/genai`)
-   **Module Loading**: ES Modules directly in the browser via import maps (no build step required for basic operation).

## Prerequisites

1.  **Web Browser**: A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
2.  **Google Gemini API Key**: You **must** have a valid API key for the Google Gemini API.
    -   You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup and Running

KBook is designed to run directly in the browser without a complex build process.

**1. API Key Configuration:**

   The application exclusively obtains the Gemini API key from the environment variable `process.env.API_KEY`. This variable **must be pre-configured, valid, and accessible** in the execution context where the application is run.

   *   **For Local Development/Testing:** Since this is a client-side application without a Node.js backend to easily manage `process.env`, you'll need to ensure this variable is available to `index.html`.
        *   One common way to test applications that expect `process.env` variables locally is to use a simple development server that can inject environment variables or serve files with headers.
        *   Alternatively, for quick local testing **ONLY** (and **NEVER** for deployment or committing to version control), you could temporarily modify `services/geminiService.ts`:
            ```javascript
            // Near the top of services/geminiService.ts
            // const API_KEY = process.env.API_KEY; 
            const API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; // TEMPORARY for local testing
            ```
            **Warning**: If you do this, remember to revert the change before committing any code. The application is built to rely on `process.env.API_KEY` being defined in its true execution environment.

**2. Running the Application:**

   -   Ensure all project files (`index.html`, `index.tsx`, `App.tsx`, `components/`, `services/`, `types.ts`, `constants.ts`, `metadata.json`) are in the same directory structure as provided.
   -   Open the `index.html` file in your web browser.
     *   You might need to serve the files using a simple local HTTP server if your browser has strict security policies regarding `file:///` origins for module loading or other features. Python's `http.server` or Node.js `http-server` can be used:
        ```bash
        # Using Python
        python -m http.server
        # Using Node.js http-server (install with: npm install -g http-server)
        http-server .
        ```
        Then navigate to `http://localhost:8000` (or the port shown by the server).

## Project Structure

```
.
├── README.md                 # This file
├── index.html                # Main HTML entry point, loads React & Tailwind CSS
├── index.tsx                 # Root React component, mounts App
├── App.tsx                   # Main application component, manages state and workflow
├── metadata.json             # Application metadata
├── types.ts                  # TypeScript type definitions
├── constants.ts              # Global constants, prompt templates, language options
├── components/               # Directory for UI components
│   ├── UserInputPane.tsx       # Form for initial book details
│   ├── OutlineReviewPane.tsx   # Pane to review generated title and structure
│   ├── ChapterGenerationPane.tsx # Pane for managing/viewing chapter generation
│   ├── BookViewPane.tsx        # Pane to display the final generated book
│   ├── SectionItem.tsx         # Component for displaying individual chapter status/content
│   ├── ProgressBar.tsx         # Visual progress indicator
│   ├── LoadingIndicator.tsx    # Reusable loading spinner
│   └── DetailedCustomizationModal.tsx # Modal for fine-tuning length/reading level
└── services/                 # Directory for API services
    └── geminiService.ts      # Functions for interacting with the Gemini API
```

## How to Use KBook

1.  **API Key Check**: Upon loading, the app checks for the API key. If not configured, an error message will guide you.
2.  **Enter Book Details (Topic Pane)**:
    *   Fill in the **Book Subject/Topic**.
    *   Select the **Language** for the book.
    *   Choose the **Generation Mode** (Normal or Advanced).
    *   Customize **Chapter Length**: Use presets or the "Customize" button for detailed word count via a slider and direct input.
    *   Customize **Reading Level**: Select from descriptive presets or use the "Customize" button for a 1-10 scale adjustment.
    *   Set the **Number of Chapters** (minimum 12).
    *   Optionally, provide **Additional Instructions** for the AI.
    *   Click "Start Creating Outline".
3.  **Generating Outline & Title**: The app will show a loading indicator while the AI generates the book structure and title.
4.  **Review Outline (Review Pane)**:
    *   The generated **Book Title** and **Book Structure** (chapters and sub-sections) will be displayed.
    *   Review the content.
    *   If satisfied, click "Proceed to Write Chapters".
    *   If you want to change inputs, click "Back to Inputs & Reset".
5.  **Write Chapters (Write Pane)**:
    *   Click "Start Automatic Chapter Generation".
    *   The application will automatically generate content for each chapter one by one. You'll see:
        *   Overall progress (e.g., "3 / 12 Chapters Completed").
        *   The status of each chapter (Pending, Writing, Done, Error).
        *   Streamed content appearing in real-time for the chapter currently being written.
    *   If an error occurs during generation, the process might halt. You can review any generated content.
6.  **View Book (Read Pane)**:
    *   Once all chapters are processed (either successfully or with errors), click "View Full Book".
    *   The complete book, including the title and all successfully generated chapters, will be displayed.
    *   **Export**:
        *   Click "Copy Book (Markdown)" to copy the entire book content to your clipboard.
        *   Click "Download Book (.txt)" to save the book as a text file (Markdown formatted).
7.  **Create Another Book**: Click "Create Another Book" to start over.

---

Enjoy creating your next masterpiece with KBook AI!

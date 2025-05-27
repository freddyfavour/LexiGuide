# LexiGuide - AI-Powered Contract Analysis

LexiGuide is a web application designed to help users understand complex legal contracts by leveraging the power of Generative AI. It provides clause-by-clause breakdowns, plain-English summaries, risk assessments, and actionable recommendations. This project was developed with the assistance of Firebase Studio.

## Features

*   **Contract Input:** Upload contracts as `.txt` files or paste text directly.
*   **Automated Clause Segmentation:** The AI automatically identifies and separates individual clauses from the contract text.
*   **Plain-English Summaries:** Each clause is accompanied by a clear, concise summary in everyday language.
*   **Per-Clause Risk Assessment:** Each clause summary is color-coded (Green for Low, Blue for Medium, Red for High) based on its assessed risk level, with a brief explanation.
*   **Overall Contract Analysis:**
    *   **General Risk Assessment:** A holistic overview of potential risks identified throughout the entire contract, presented as a list.
    *   **Recommendations:** Actionable advice and areas to focus on regarding the contract as a whole, presented as a list.
*   **Responsive Design:** User-friendly interface accessible on various screen sizes.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Firebase Studio](studio.firebase.google.com)
*   **UI:**
    *   [ShadCN UI](https://ui.shadcn.com/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Lucide React](https://lucide.dev/) (for icons)
*   **Generative AI:**
    *   [Genkit (by Google)](https://firebase.google.com/docs/genkit) - Used for defining and running AI flows.
    *   Google's Gemini Models (via Genkit)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Environment Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/freddyfavour/LexiGuide
    cd LexiGuide
    ```
2.  **Create an environment file:**
    You will need to add your Google Generative AI API key here for Genkit to function:
    ```env
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
    Refer to the [Genkit documentation](https://firebase.google.com/docs/genkit/get-started#api-key) for information on obtaining an API key.

### Installation

Install the project dependencies:

```bash
npm install
# or
yarn install
```

### Running the Application

The application consists of two main parts that need to be run concurrently: the Next.js frontend and the Genkit development server.

1.  **Start the Genkit development server:**
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes in AI flows:
    ```bash
    npm run genkit:watch
    ```
    This server typically runs on port `4000` and handles the AI flow executions.

2.  **Start the Next.js development server:**
    Open another terminal and run:
    ```bash
    npm run dev
    ```
    This will start the Next.js frontend, usually on `http://localhost:9002`.

Open `http://localhost:9002` in your browser to view the application.

### Building for Production

To create a production build:

```bash
npm run build
```

And to start the production server:

```bash
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.


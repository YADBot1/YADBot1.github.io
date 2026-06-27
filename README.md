# Stock Keymaster 🔑

*Generate metadata for stock photos and videos using AI without limits.*

**Stock Keymaster** is a lightweight, purely client-side web application that uses the Google Gemini API to automatically generate commercially attractive titles, detailed descriptions, and highly relevant keywords for your stock media (photos and videos). Perfect for Adobe Stock contributors.

## ✨ Features

- **No Backend Required:** Runs entirely in your browser. Your files stay local and secure.
- **Photo & Video Support:** Automatically extracts keyframes from videos (at 10%, 50%, and 90% duration) to generate accurate metadata.
- **Smart Generation:** Creates a 5-10 word title, a 2-3 sentence description, and exactly 49 highly relevant keywords.
- **Hover Preview:** Instantly preview images and play videos simply by hovering over thumbnails in the table.
- **Bilingual UI:** Switch seamlessly between English and Ukrainian (preferences saved via cookies).
- **One-Click Copy:** Easily copy generated text to your clipboard.
- **Resilient Processing:** Built-in error handling and automatic retries for API rate limits.

## 🚀 How to Use

1. Clone this repository or download the files.
2. Open `index.html` in any modern web browser.
3. Obtain a free [Google Gemini API Key](https://aistudio.google.com/app/apikey).
4. Paste your API key into the app and click **Connect**.
5. Click **Select folder** and choose a local folder containing your media.
6. Click **Start generation** and copy the results!

## 🛠️ Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Google Gemini API (Generative AI)

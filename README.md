# TomoGame - The Ultimate Friendship Quiz

TomoGame is a fun and interactive platform where you can create quizzes about yourself and share them with your friends to see how well they really know you.

## Features

- **Create Your Quiz**: Craft unique questions about your likes, dislikes, memories, and secrets.
- **Draft System**: Automatically save your progress as you create. Resume or delete drafts from your home page.
- **My Quizzes**: Manage all your published quizzes and surveys in one place.
- **Privacy Controls**: Choose between Public and Private visibility for your published content.
- **Share & Compare**: Send your quiz link to friends and see who scores the highest.
- **Track Results**: View detailed scoreboards to see who knows you best.
- **Auto-Registration**: Seamless sign-up process. Just enter a username and password to get started.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database

## Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables in `.env.local`.
4.  Run the development server: `npm run dev`
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory and add the following Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Concept

"Tomo" comes from the Japanese word "Tomodachi" (Friend). This platform is designed to strengthen bonds between friends through fun and engaging trivia.

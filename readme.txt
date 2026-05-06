Real-time Chat Application
==========================

A full-stack MERN (MongoDB, Express, React, Node.js) chat application with real-time features powered by Socket.io.

Features:
- Real-time messaging
- Online/Offline status indicators with green dots
- "Last Seen" tracking for offline users
- Typing indicators (e.g., "User is typing...")
- Image sharing support via Cloudinary
- Secure user authentication using JWT
- Message status receipts (Sent, Delivered, Read)

Setup Instructions:

1. Backend (Server):
   - Navigate to the /server directory.
   - Run `npm install` to install dependencies.
   - Create a .env file and configure: MONGODB_URI, JWT_SECRET, CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
   - Start the server using `node server.js` (Default port: 5001).

2. Frontend (Client):
   - Navigate to the /client directory.
   - Run `npm install`.
   - Create a .env file and set VITE_BACKEND_URL to your server URL (e.g., http://localhost:5001).
   - Run the development server using `npm run dev`.

Note: If you encounter an "EADDRINUSE" error on port 5001, ensure any previous instances of the server are closed or kill the process using the port.
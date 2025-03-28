import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import http from "http";
import session from "express-session";

import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import connectMongo from "connect-mongodb-session";
import connectDB from "./db/connectDB.js";

import { buildContext } from "graphql-passport";
import passport from "passport";
import { configurePassport } from "./passport/passport.config.js";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import userTypeDef from "./typeDefs/user.typeDef.js";
import userResolvers from "./resolvers/user.resolver.js";
import todoTypeDefs from "./typeDefs/todo.typeDef.js";
import todoResolvers from "./resolvers/todo.resolver.js";

// Load environment variables
dotenv.config();
const app = express();
const httpServer = http.createServer(app); // Create an HTTP server

configurePassport();

// Set environment variable to suppress deprecation warnings (optional)
process.env.MONGO_DISABLE_DEPRECATED_COMMANDS = "true";

// Get MongoDB URI from .env file
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB URI is not set in the .env file");
  process.exit(1);
}

// Connect to MongoDB
// mongoose
//   .connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true, // Add this line
//     useFindAndModify: false, // Optional but recommended
//   })
//   .then(() => {
//     console.log("MongoDB connected successfully");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

// MongoDB session store setup
const MongoDBStore = connectMongo(session);

// Create a new MongoDB store
const store = new MongoDBStore({
  uri: uri,
  collection: "sessions",
});

// Handle errors in the session store
store.on("error", (err) => console.log(err));

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Prevents JavaScript access to cookies
      sameSite: "lax",
    },
    store: store,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set environment variable to suppress deprecation warnings (optional)
process.env.MONGO_DISABLE_DEPRECATED_COMMANDS = "true";

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs: [userTypeDef, todoTypeDefs],
  resolvers: [userResolvers, todoResolvers],
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  debug: true, // Enable debugging
  formatError: (error) => {
    console.error("Apollo Server error:", error); // Log Apollo Server errors
    return error;
  },
});
// Start the Apollo Server and apply middleware
await server.start();

// Set up CORS and middleware
app.use(
  "/graphql",
  cors({
    origin: "https://scandiweb-ready.onrender.com",
    credentials: true, // Allow credentials (cookies)
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }), // Integrate Passport with Apollo Server
  })
);

// Start the server on the specified port or 4000 if not provided in the environment variable.
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Start the HTTP server
await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve))
  .then(async () => {
    // Log the server start message
    console.log(
      `Server is running on http://scandiweb-ready.vercel.app:${PORT}/graphql`
    );
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });

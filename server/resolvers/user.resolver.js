import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const userResolver = {
  Query: {
    users: async () => {
      return await User.find();
    },
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        console.error("Error in authUser: ", err);
        throw new Error("Internal server error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.error("Error in user query:", err);
        throw new Error(err.message || "Error getting user");
      }
    },
  },
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, password } = input;

        if (!username || !password) {
          throw new Error("All fields are required");
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          username,
          password: hashedPassword,
        });

        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (err) {
        console.error("Error in signUp: ", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        if (!username || !password) throw new Error("All fields are required");
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (err) {
        console.error("Error in login:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    // logout: async (_, __, context) => {
    //   try {
    //     console.log("Logout initiated"); // Debugging: Log start of logout
    //     await context.logout();
    //     console.log("Passport logout completed"); // Debugging: Log after passport logout

    //     // Properly await session destruction
    //     await new Promise((resolve, reject) => {
    //       context.req.session.destroy((err) => {
    //         if (err) {
    //           console.error("Session destruction error:", err); // Debugging: Log session destruction error
    //           reject(err);
    //         } else {
    //           console.log("Session destroyed successfully"); // Debugging: Log successful session destruction
    //           resolve();
    //         }
    //       });
    //     });

    //     // Clear the session cookie
    //     context.res.clearCookie("connect.sid");
    //     console.log("Session cookie cleared"); // Debugging: Log cookie clearing

    //     return { message: "Logged out successfully" };
    //   } catch (err) {
    //     console.error("Error in logout:", err); // Debugging: Log any errors
    //     throw new Error(err.message || "Internal server error");
    //   }
    // },
    logout: async (_, __, context) => {
      try {
        const { req, res } = context;

        // Ensure the logout method is available
        if (!req.logout) {
          throw new Error("Logout method not available");
        }

        // Log out the user
        // await new Promise((resolve, reject) => {
        //   req.logout((err) => {
        //     if (err) {
        //       console.error("Error in logout:", err);
        //       reject(err);
        //     } else {
        //       resolve();
        //     }
        //   });
        // });

        // Destroy the session
        await new Promise((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) {
              console.error("Error destroying session:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });

        // Clear the session cookie
        res.clearCookie("connect.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        return { message: "Logged out successfully" };
      } catch (err) {
        console.error("Error in logout:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
};

export default userResolver;

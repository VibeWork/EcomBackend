import  { Request, Response,NextFunction } from "express";
import { auth as firebaseAuth } from "../config/firebase";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import User from "../models/User.model";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret";

export class FirebaseAuthController {


async verifyFirebaseTokenAndSync(req: Request, res: Response) {
  try {
    console.log("✅ /firebase/verify route hit");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid token" });
      return;
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 🔍 First, check if user already exists by firebaseId
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("*")
      .eq("firebaseId", uid)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("❌ Supabase lookup error:", lookupError.message);
      return res.status(500).json({ error: "Database lookup failed" });
    }

    let user = existingUser;

    // 🆕 If user doesn't exist, create one
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          userId: uuidv4(),
          firebaseId: uid,
          email,
          name,
          profilePicture: picture,
          role: "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Supabase insert error:", insertError.message);
        return res.status(500).json({ error: "Error saving new user" });
      }

      user = newUser;
    }

    res.status(200).json({
      message: "✅ Firebase token verified and user synced",
      user,
    });
  } catch (error: any) {
    console.error("❌ Firebase Auth error:", error.message);
    res.status(401).json({ error: "Unauthorized" });
  }
}

// async syncAllFirebaseUsers(req: Request, res: Response) {
//   try {
//     const users: any[] = [];
//     let nextPageToken: string | undefined;

//     do {
//       const listUsersResult = await firebaseAuth.listUsers(1000, nextPageToken);
//       users.push(...listUsersResult.users);
//       nextPageToken = listUsersResult.pageToken;
//     } while (nextPageToken);  

//     const now = new Date().toISOString();

//     const transformedUsers = users.map(user => ({
//   userId: uuidv4(), // ✅ generate a unique userId
//   firebaseId: user.uid,
//   email: user.email,
//   name: user.displayName || "",
//   profilePicture: user.photoURL || "",
//   role: "user",
//   createdAt: now,
//   updatedAt: now
// }));

//     const { data, error } = await supabase
//       .from("users")
//       .upsert(transformedUsers, { onConflict: "firebaseId" });

//     if (error) {
//       console.error("Supabase error during bulk sync:", error.message);
//       return res.status(500).json({ error: "Failed to sync users to Supabase" });
//     }

//     res.status(200).json({
//       message: "✅ Successfully synced all Firebase users to Supabase",
//       count: transformedUsers.length,
//       users: data,
//     });
//   } catch (error: any) {
//     console.error("Error during sync:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
async syncAllFirebaseUsers(req: Request, res: Response) {
  try {
    const users: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const listUsersResult = await firebaseAuth.listUsers(1000, nextPageToken);
      users.push(...listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    const now = new Date().toISOString();

    // Fetch existing users to preserve custom fields
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("firebaseId, userId, email, name, profilePicture, role, createdAt");

    if (fetchError) {
      console.error("❌ Error fetching existing users:", fetchError.message);
      return res.status(500).json({ error: "Error fetching users from Supabase" });
    }

    // Map for easy lookup
    const userMap = new Map<string, any>();
    existingUsers?.forEach(user => {
      userMap.set(user.firebaseId, user);
    });

    // Build upsert-ready user records
    const transformedUsers = users.map(fbUser => {
      const firebaseId = fbUser.uid;
      const existing = userMap.get(firebaseId);

      return {
        userId: existing?.userId || uuidv4(),
        firebaseId,
        email: fbUser.email || existing?.email || "",
        name: existing?.name ?? fbUser.displayName ?? "",
        profilePicture: existing?.profilePicture ?? fbUser.photoURL ?? "",
        role: existing?.role ?? "user",
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
    });

    const { data, error } = await supabase
      .from("users")
      .upsert(transformedUsers, { onConflict: "firebaseId" });

    if (error) {
      console.error("❌ Supabase upsert error:", error.message);
      return res.status(500).json({ error: "Failed to sync users to Supabase" });
    }

    res.status(200).json({
      message: "✅ Successfully synced all Firebase users to Supabase",
      count: transformedUsers.length,
      users: data,
    });

  } catch (error: any) {
    console.error("❌ Error during sync:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

   


  // async generateJwtForUser(req: Request, res: Response) {
  //   try {
  //     console.log("🔐 Generating JWT for user...");

  //     const { userId, email, name, profile, sessionId,firebaseId } = req.body;

  //     if (!userId) {
  //       return res.status(400).json({ error: "userId is required" });
  //     }

  //     let user = await User.findOne({ where: { userId } });

  //     if (!user) {
  //       console.log(`User with userId ${userId} not found. Creating new user...`);
  //       user = await User.create({
  //         userId,
  //         email,
  //         name,
  //         profile,
  //         role: "user",
  //         firebaseId,
  //       });
  //     }

  //     const payload = {
  //       userId: user.userId,
  //       email: user.email,
  //       name: user.name,
  //       profile: user.profile,
  //       role: user.role,
  //       sessionId: sessionId || undefined,
  //       firebaseId: user.firebaseId || undefined,
  //       exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year expiration
  //     };

  //     const token = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });

  //     return res.status(200).json({ jwt: token });
  //   } catch (error: any) {
  //     console.error("❌ Error generating JWT:", error.message);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  // }




 async generateJwtForUser(req: Request, res: Response) {
    try {
      console.log("🔐 Generating JWT for user...");

      const { userId, email, name, profile, sessionId,firebaseId } = req.body;
    // Check if either userId or firebaseId is provided
    if (!userId && !firebaseId) {
      return res.status(400).json({ error: "Either userId or firebaseId is required" });
    }

    let user;

    // Try to find user by userId first, then by firebaseId
    if (userId) {
      user = await User.findOne({ where: { userId } });
    } else if (firebaseId) {
      user = await User.findOne({ where: { firebaseId } });
    }

      if (!user) {
        console.log(`User with userId ${userId} not found. Creating new user...`);
        user = await User.create({
          userId,
          email,
          name,
          profile,
          role: "user",
          firebaseId,
        });
      }

      const payload = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        profile: user.profile,
        role: user.role,
        sessionId: sessionId || undefined,
        firebaseId: user.firebaseId || undefined,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year expiration
      };

      const token = jwt.sign(payload, SECRET_KEY, { algorithm: "HS256" });

      return res.status(200).json({ jwt: token });
    } catch (error: any) {
      console.error("❌ Error generating JWT:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }





















}
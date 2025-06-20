"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthController = void 0;
const firebase_1 = require("../config/firebase");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const User_model_1 = __importDefault(require("../models/User.model"));
dotenv_1.default.config();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret";
class FirebaseAuthController {
    verifyFirebaseTokenAndSync(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("✅ /firebase/verify route hit");
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    res.status(401).json({ error: "Missing or invalid token" });
                    return;
                }
                const idToken = authHeader.split(" ")[1];
                const decodedToken = yield firebase_1.auth.verifyIdToken(idToken);
                const { uid, email, name, picture } = decodedToken;
                // 🔍 First, check if user already exists by firebaseId
                const { data: existingUser, error: lookupError } = yield supabase
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
                    const { data: newUser, error: insertError } = yield supabase
                        .from("users")
                        .insert({
                        userId: (0, uuid_1.v4)(),
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
            }
            catch (error) {
                console.error("❌ Firebase Auth error:", error.message);
                res.status(401).json({ error: "Unauthorized" });
            }
        });
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
    syncAllFirebaseUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = [];
                let nextPageToken;
                do {
                    const listUsersResult = yield firebase_1.auth.listUsers(1000, nextPageToken);
                    users.push(...listUsersResult.users);
                    nextPageToken = listUsersResult.pageToken;
                } while (nextPageToken);
                const now = new Date().toISOString();
                // Fetch existing users to preserve custom fields
                const { data: existingUsers, error: fetchError } = yield supabase
                    .from("users")
                    .select("firebaseId, userId, email, name, profilePicture, role, createdAt");
                if (fetchError) {
                    console.error("❌ Error fetching existing users:", fetchError.message);
                    return res.status(500).json({ error: "Error fetching users from Supabase" });
                }
                // Map for easy lookup
                const userMap = new Map();
                existingUsers === null || existingUsers === void 0 ? void 0 : existingUsers.forEach(user => {
                    userMap.set(user.firebaseId, user);
                });
                // Build upsert-ready user records
                const transformedUsers = users.map(fbUser => {
                    var _a, _b, _c, _d, _e;
                    const firebaseId = fbUser.uid;
                    const existing = userMap.get(firebaseId);
                    return {
                        userId: (existing === null || existing === void 0 ? void 0 : existing.userId) || (0, uuid_1.v4)(),
                        firebaseId,
                        email: fbUser.email || (existing === null || existing === void 0 ? void 0 : existing.email) || "",
                        name: (_b = (_a = existing === null || existing === void 0 ? void 0 : existing.name) !== null && _a !== void 0 ? _a : fbUser.displayName) !== null && _b !== void 0 ? _b : "",
                        profilePicture: (_d = (_c = existing === null || existing === void 0 ? void 0 : existing.profilePicture) !== null && _c !== void 0 ? _c : fbUser.photoURL) !== null && _d !== void 0 ? _d : "",
                        role: (_e = existing === null || existing === void 0 ? void 0 : existing.role) !== null && _e !== void 0 ? _e : "user",
                        createdAt: (existing === null || existing === void 0 ? void 0 : existing.createdAt) || now,
                        updatedAt: now,
                    };
                });
                const { data, error } = yield supabase
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
            }
            catch (error) {
                console.error("❌ Error during sync:", error.message);
                res.status(500).json({ error: "Internal server error" });
            }
        });
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
    generateJwtForUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🔐 Generating JWT for user...");
                const { userId, email, name, profile, sessionId, firebaseId } = req.body;
                // Check if either userId or firebaseId is provided
                if (!userId && !firebaseId) {
                    return res.status(400).json({ error: "Either userId or firebaseId is required" });
                }
                let user;
                // Try to find user by userId first, then by firebaseId
                if (userId) {
                    user = yield User_model_1.default.findOne({ where: { userId } });
                }
                else if (firebaseId) {
                    user = yield User_model_1.default.findOne({ where: { firebaseId } });
                }
                if (!user) {
                    console.log(`User with userId ${userId} not found. Creating new user...`);
                    user = yield User_model_1.default.create({
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
                const token = jsonwebtoken_1.default.sign(payload, SECRET_KEY, { algorithm: "HS256" });
                return res.status(200).json({ jwt: token });
            }
            catch (error) {
                console.error("❌ Error generating JWT:", error.message);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.FirebaseAuthController = FirebaseAuthController;

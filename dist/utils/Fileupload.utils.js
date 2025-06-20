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
exports.cloudinaryImageUploadMethod = void 0;
//Utils/FileUpload.util.ts
const cloudinary_1 = __importDefault(require("cloudinary"));
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
const Cloudinary = cloudinary_1.default.v2;
// Configure Cloudinary with environment variables
Cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
// console.log('Cloudinary Config:', {
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });
const cloudinaryImageUploadMethod = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        Cloudinary.uploader.upload(file, { folder: '/body-clone' }, (err, res) => {
            if (err) {
                console.error('Cloudinary Upload Error:', err);
                return reject(`Upload image error: ${err.message}`);
            }
            if (!res) {
                return reject('No response from Cloudinary');
            }
            resolve(res.secure_url);
        });
    });
});
exports.cloudinaryImageUploadMethod = cloudinaryImageUploadMethod;

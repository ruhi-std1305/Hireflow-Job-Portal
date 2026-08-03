import multer  from "multer";
import path    from "path";
import fs      from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// backend/uploads/resumes — এখানে actual resume file গুলো disk-e save হবে
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "resumes");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        // userId + timestamp দিয়ে unique filename — কারো file অন্য কারো টা overwrite করবে না
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${req.id}-${Date.now()}${ext}`);
    },
});

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOC, or DOCX files are allowed."));
}

export const uploadResumeMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

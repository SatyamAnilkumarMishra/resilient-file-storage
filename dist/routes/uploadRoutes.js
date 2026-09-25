"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/init', authMiddleware_1.authMiddleware, uploadController_1.uploadController.initiate);
router.get('/:uploadId/part-url/:chunkNumber', authMiddleware_1.authMiddleware, uploadController_1.uploadController.getPartUrl);
router.post('/:uploadId/chunks/:chunkNumber/confirm', authMiddleware_1.authMiddleware, uploadController_1.uploadController.confirmChunk);
router.get('/:uploadId/status', authMiddleware_1.authMiddleware, uploadController_1.uploadController.getStatus);
router.post('/:uploadId/finalize', authMiddleware_1.authMiddleware, uploadController_1.uploadController.finalize);
// Mock S3 direct part upload simulation route
router.put('/mock-s3-upload', uploadController_1.uploadController.mockS3Upload);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map

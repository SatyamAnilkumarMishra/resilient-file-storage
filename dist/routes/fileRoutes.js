"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileController_1 = require("../controllers/fileController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, fileController_1.fileController.listFiles);
router.get('/quota/usage', authMiddleware_1.authMiddleware, fileController_1.fileController.getQuota);
router.get('/download-mock', fileController_1.fileController.downloadMockFile);
router.get('/:fileId', authMiddleware_1.authMiddleware, fileController_1.fileController.getFileDetails);
router.delete('/:fileId', authMiddleware_1.authMiddleware, fileController_1.fileController.deleteFile);
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map

// Resilient Distributed File Storage Platform - Client Engine

const API_BASE = '/api';
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB standard S3 part size
const MAX_PARALLEL_UPLOADS = 3;
const MAX_PART_RETRIES = 3;

// Application State
const state = {
  token: sessionStorage.getItem('auth_token') || null,
  user: null,
  selectedFile: null,
  fileHash: null,
  uploadId: null,
  totalChunks: 0,
  chunkSizeBytes: DEFAULT_CHUNK_SIZE,
  chunkUrls: [], // array of { chunkNumber, url }
  chunkStates: [], // 'pending' | 'uploading' | 'uploaded' | 'confirmed' | 'failed'
  chunkEtags: [], // etag string per chunk
  activeXhrs: new Map(), // chunkNumber -> XMLHttpRequest
  activeWorkers: 0,
  bytesUploaded: 0,
  startTime: null,
  isUploading: false,
  isDropSimulated: false,
  isCanceled: false
};

// DOM Element References
const elements = {
  authPanel: document.getElementById('authPanel'),
  uploaderPanel: document.getElementById('uploaderPanel'),
  userEmailDisplay: document.getElementById('userEmailDisplay'),
  signOutBtn: document.getElementById('signOutBtn'),
  authForm: document.getElementById('authForm'),
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  signInSubmitBtn: document.getElementById('signInSubmitBtn'),
  registerSubmitBtn: document.getElementById('registerSubmitBtn'),
  authError: document.getElementById('authError'),
  dropzone: document.getElementById('dropzone'),
  chooseFileBtn: document.getElementById('chooseFileBtn'),
  fileInput: document.getElementById('fileInput'),
  fileInfoSection: document.getElementById('fileInfoSection'),
  infoFileName: document.getElementById('infoFileName'),
  infoFileSize: document.getElementById('infoFileSize'),
  infoContentType: document.getElementById('infoContentType'),
  infoFileHash: document.getElementById('infoFileHash'),
  infoTotalChunks: document.getElementById('infoTotalChunks'),
  dedupNotice: document.getElementById('dedupNotice'),
  resumePrompt: document.getElementById('resumePrompt'),
  resumePromptBtn: document.getElementById('resumePromptBtn'),
  discardPromptBtn: document.getElementById('discardPromptBtn'),
  errorNotice: document.getElementById('errorNotice'),
  startBtn: document.getElementById('startBtn'),
  dropBtn: document.getElementById('dropBtn'),
  resumeBtn: document.getElementById('resumeBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  progressSection: document.getElementById('progressSection'),
  progressText: document.getElementById('progressText'),
  progressPercent: document.getElementById('progressPercent'),
  progressBarFill: document.getElementById('progressBarFill'),
  bytesStats: document.getElementById('bytesStats'),
  speedStats: document.getElementById('speedStats'),
  etaStats: document.getElementById('etaStats'),
  chunkMapSection: document.getElementById('chunkMapSection'),
  chunkGrid: document.getElementById('chunkGrid'),
  activityLog: document.getElementById('activityLog'),
  clearLogBtn: document.getElementById('clearLogBtn')
};

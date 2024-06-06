import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.8.335/build/pdf.worker.min.js';

export { getDocument };

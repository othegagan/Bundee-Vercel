'use client';

export default function PDFViewerComponent({ url }: { url: string }) {
    const encodedUrl = encodeURIComponent(url);
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <iframe title='PDF Viewer' src={googleDocsUrl} width='100%' height='100%' style={{ border: 'none' }} allowFullScreen>
                This browser does not support PDFs. Please download the PDF to view it:
                <a href={url}>Download PDF</a>
            </iframe>
        </div>
    );
}

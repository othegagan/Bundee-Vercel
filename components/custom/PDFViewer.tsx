'use client';
import React from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

export default function PDFViewer({ docs }: { docs: any[] }) {
    return (
        <DocViewer
            className='rounded-md border'
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            prefetchMethod='GET'
            style={{ width: '100%', height: 450, margin: 'auto', overflow: 'auto' }}
            config={{
                header: {
                    disableHeader: true,
                    disableFileName: true,
                    retainURLParams: false,
                },
                csvDelimiter: ',', // "," as default,
                pdfZoom: {
                    defaultZoom: 1, // 1 as default,
                    zoomJump: 0.2, // 0.1 as default,
                },
                pdfVerticalScrollByDefault: true, // false as default
            }}
        />
    );
}

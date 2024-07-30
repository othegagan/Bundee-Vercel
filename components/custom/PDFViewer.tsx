'use client';

import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts`,
};

export default function PDFViewerComponent({ link }: { link: any }) {
    const [numPages, setNumPages] = useState<number | null>(null);

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }, [link]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className='flex flex-col items-center justify-center gap-4 p-2'>
            <div
                style={{
                    width: '100%',
                    height: 450,
                    margin: 'auto',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                }}>
                <Document file={link} onLoadSuccess={onDocumentLoadSuccess} options={options} className='mx-auto'>
                    {Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_container_${index + 1}`} className='flex flex-col items-center'>
                            <p className='ml-auto mt-2 text-xs'>
                                Page {index + 1} of {numPages}
                            </p>
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} renderMode='canvas' className='pdf-page' />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}

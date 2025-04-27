import { useEffect, useRef } from 'react'
import  * as pdfjsLib from 'pdfjs-dist';

import { type Highlight } from '../types/pdfPage';

const PdfViewer = (
    { highlights, pdf, pageNumber }:
    { highlights: Highlight[]; pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number }
) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!pdf) return;
        let renderTask: pdfjsLib.RenderTask | null = null;

        (async () => {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRef.current!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const canvasContext = canvas.getContext('2d')!;
            renderTask = page.render({ canvasContext, viewport });

            await renderTask.promise;
        })();

        return () => renderTask?.cancel();
    }, [pdf, pageNumber]);

    return (
        <div className="relative w-fit shadow">
            <canvas ref={canvasRef} className="mx-auto my-0" />

            {/* overlay highlights */}
            {highlights.map((box, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 mx-auto my-0 opacity-35 pointer-events-none bg-yellow-300"
                    style={{
                        top: box.y,
                        width: box.width,
                        height: box.height,
                    }}
                />
            ))}
        </div>
    );
  };

export default PdfViewer;

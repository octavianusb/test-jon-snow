import  * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs';

import PdfViewer from '../components/PdfViewer';
import PdfSidebar from '../components/PdfSidebar';
import usePdf from '../hooks/usePdf';
import { references } from '../constants/references';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function PdfWrapper({ pdfUrl }: { pdfUrl: string }) {
    const { pdf, scrollToPage, highlights, pageRefs, activeReference } = usePdf({ pdfUrl });

    return (
        <div className="flex bg-gray-100">
            <PdfSidebar
                references={references}
                onScrollToSection={scrollToPage}
                activeReference={activeReference}
            />

            <div className="overflow-x-scroll h-screen p-[10px] grow gap-3 flex flex-col">
                {pdf && Array.from(new Array(pdf.numPages), (_, idx) => (
                    <div
                        key={`page_${idx + 1}`}
                        ref={el => { pageRefs.current[idx+1] = el; }}
                    >
                        <PdfViewer
                            highlights={highlights[idx+1] || []}
                            pageNumber={idx + 1}
                            pdf={pdf}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PdfWrapper;

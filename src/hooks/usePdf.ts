import { useEffect, useRef, useState } from 'react'
import  * as pdfjsLib from 'pdfjs-dist';
import { type TextItem } from 'pdfjs-dist/types/src/display/api';

import { buildReferenceMap, normalizeTxt } from '../lib/helpers';
import { type Highlight } from '../types/pdfPage';

export default function usePdf({ pdfUrl }: { pdfUrl: string }) {
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [highlights, setHighlights] = useState<Record<number, Highlight[]>>({});
    const [activeReference, setActiveReference] = useState<string | null>(null);
    const textIndex = useRef<Record<number, TextItem[]>>({});
    const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const referenceHighlightMap = useRef<Record<string, { page: number; boxes: Highlight[] }>>({});

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const loadedPdf = await loadingTask.promise;
            if (cancelled) return;
            setPdf(loadedPdf);

            const pagesData = await Promise.all(
                Array.from({ length: loadedPdf.numPages }, async (_, i) => {
                    const page = await loadedPdf.getPage(i + 1);
                    const text = await page.getTextContent();
                    return { page, items: text.items as TextItem[] };
                })
            );
            if (cancelled) return;

            const { refMap, textIndex: index } = await buildReferenceMap(pagesData);
            referenceHighlightMap.current = refMap;
            textIndex.current = index;
        })();

        return () => { cancelled = true; };
    }, [pdfUrl]);

    const scrollToPage = async (query: string) => {
        const data = referenceHighlightMap.current[normalizeTxt(query)];
        setActiveReference(query);
        if (!data) return;

        setHighlights(prev => ({ ...prev, [data.page]: data.boxes }));
        const highlightSection = pageRefs.current[data.page];
        if (highlightSection) highlightSection.scrollIntoView({ behavior: 'smooth' });
    };

    return {
        pdf,
        scrollToPage,
        highlights,
        setHighlights,
        textIndex,
        pageRefs,
        activeReference,
    };
}
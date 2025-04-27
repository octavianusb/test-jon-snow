import  * as pdfjsLib from 'pdfjs-dist';
import { type TextItem } from 'pdfjs-dist/types/src/display/api';

import { references } from '../constants/references';
import { type Highlight } from '../types/pdfPage';

export const normalizeTxt = (s: string) => s.toLowerCase().replace(/\s\s+/g, ' ').trim();

export const findMatches = (items: TextItem[], refStr: string): TextItem[] => {
    const refNorm = normalizeTxt(refStr);
    let matches: TextItem[] = [];

    items.reduce((acc, el, idx, arr) => {
        const normAcc = normalizeTxt(`${acc} ${el.str}`);

        if (refNorm.includes(normAcc) || normAcc.includes(refNorm)) {
            if (!(el.str.length === 0 && matches.length === 0)) {
                matches.push(el);
            }

            if (normAcc.includes(refNorm)) arr.splice(1); // short-circuit

            return normAcc;
        }

        matches = [];
        return '';
    }, '');

    return matches;
};

export const createHighlight = (matches: TextItem[], viewport: pdfjsLib.PageViewport): Highlight[] => {
    if (!matches.length) return [];

    const py = 20;
    const px = 150;
    const { scale, height, width } = viewport;
    const firstItem = matches[0];
    const lastItem = matches[matches.length - 1];

    const firstY = height - (firstItem.transform[5] * scale);
    const lastY = height - (lastItem.transform[5] * scale);

    return [{
        x: 0,
        y: Math.min(firstY, lastY) - py,
        width: width - px,
        height: Math.abs(firstY - lastY) + py,
    }];
};

export const buildReferenceMap = async (pagesData: { page: pdfjsLib.PDFPageProxy, items: TextItem[] }[]) => {
    const referencesObj = new Set(references.map(r => normalizeTxt(r.content)));
    const refMap: Record<string, { page: number; boxes: Highlight[] }> = {};
    const textIndex: Record<number, TextItem[]> = {};

    for (const { page, items } of pagesData) {
        const pageNum = page.pageNumber;
        const pageTextNorm = normalizeTxt(items.map(el => el.str).join(' '));
        textIndex[pageNum] = items;

        referencesObj.forEach(refStr => {
            if (!pageTextNorm.includes(refStr)) return;

            const matches = findMatches(items, refStr);
            if (!matches.length) return;

            const viewport = page.getViewport({ scale: 1.5 });
            const boxes = createHighlight(matches, viewport);

            refMap[refStr] = { page: pageNum, boxes };
            referencesObj.delete(refStr);
        });

        if (referencesObj.size === 0) break;
    }

    return { refMap, textIndex };
}
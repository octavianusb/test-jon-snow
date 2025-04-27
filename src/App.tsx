import React from 'react';

import pdfUrl from './assets/files/dental.pdf';
import PdfWrapper from './pages/PdfWrapper';
import './App.css';

function App() {
    return (
        <div className="App">
            <PdfWrapper pdfUrl={pdfUrl} />
        </div>
    );
}

export default App;

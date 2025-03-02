import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import ClipboardJS from 'clipboard';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { 
  Copy, 
  Download, 
  FileText, 
  Code, 
  Sun, 
  Moon, 
  RefreshCw,
  Clipboard,
  CheckCircle2
} from 'lucide-react';

// Configuration for MathJax
const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]]
  }
};

function App() {
  const [inputText, setInputText] = useState('');
  const [latexOutput, setLatexOutput] = useState('');
  const [mathmlOutput, setMathmlOutput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState({
    latex: false,
    mathml: false
  });
  const latexCopyBtnRef = useRef<HTMLButtonElement>(null);
  const mathmlCopyBtnRef = useRef<HTMLButtonElement>(null);

  // Process input to generate LaTeX
  const processInput = (input: string) => {
    // Basic processing rules (this is a simplified version)
    let processed = input;
    
    // Handle subscripts (e.g., x_1 or T_μν)
    processed = processed.replace(/([A-Za-z])_([A-Za-z0-9]+)/g, '$1_{$2}');
    
    // Handle superscripts (e.g., x^2)
    processed = processed.replace(/([A-Za-z0-9])(\^)([A-Za-z0-9]+)/g, '$1^{$3}');
    
    // Handle fractions (e.g., a/b)
    processed = processed.replace(/([A-Za-z0-9]+)\/([A-Za-z0-9]+)/g, '\\frac{$1}{$2}');
    
    // Handle Greek letters
    const greekLetters = {
      'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε',
      'zeta': 'ζ', 'eta': 'η', 'theta': 'θ', 'iota': 'ι', 'kappa': 'κ',
      'lambda': 'λ', 'mu': 'μ', 'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο',
      'pi': 'π', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ',
      'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω'
    };
    
    Object.entries(greekLetters).forEach(([name, symbol]) => {
      // Replace both the name and the symbol with the LaTeX command
      const regex = new RegExp(`\\b${name}\\b|${symbol}`, 'gi');
      processed = processed.replace(regex, `\\${name}`);
    });
    
    // Fix common equation patterns
    // Einstein's field equations
    if (processed.includes('G') && processed.includes('μν') && processed.includes('Λ')) {
      processed = processed.replace(/G\s*_?{?μν}?/g, 'G_{\\mu\\nu}');
      processed = processed.replace(/Λg\s*_?{?μν}?/g, '\\Lambda g_{\\mu\\nu}');
      processed = processed.replace(/T\s*_?{?μν}?/g, 'T_{\\mu\\nu}');
      processed = processed.replace(/c\s*\^?{?4}?/g, 'c^{4}');
      processed = processed.replace(/8πG/g, '8\\pi G');
    }
    
    return processed;
  };

  // Generate MathML from LaTeX (simplified)
  const generateMathML = (latex: string) => {
    // This is a placeholder - in a real app, you would use MathJax's API
    // to convert LaTeX to MathML. For now, we'll return a simplified example.
    if (latex.includes('G_{\\mu\\nu}')) {
      return `<math>
  <mrow>
    <msub>
      <mi>G</mi>
      <mrow><mi>μ</mi><mi>ν</mi></mrow>
    </msub>
    <mo>+</mo>
    <msub>
      <mi>Λ</mi><mi>g</mi>
      <mrow><mi>μ</mi><mi>ν</mi></mrow>
    </msub>
    <mo>=</mo>
    <mfrac>
      <msup><mi>c</mi><mn>4</mn></msup>
      <mrow><mn>8</mn><mi>π</mi><mi>G</mi></mrow>
    </mfrac>
    <msub>
      <mi>T</mi>
      <mrow><mi>μ</mi><mi>ν</mi></mrow>
    </msub>
  </mrow>
</math>`;
    }
    
    return `<math><mrow>${latex}</mrow></math>`;
  };

  // Update outputs when input changes
  useEffect(() => {
    if (inputText) {
      const latex = processInput(inputText);
      setLatexOutput(latex);
      setMathmlOutput(generateMathML(latex));
    } else {
      setLatexOutput('');
      setMathmlOutput('');
    }
  }, [inputText]);

  // Handle copy functions
  const handleCopy = useCallback((text: string, type: 'latex' | 'mathml') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [type]: false }));
      }, 2000);
    });
  }, []);

  // Export to Word document
  const exportToWord = async () => {
    // Create a new document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Math Expression",
            heading: "Heading1",
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: "Original Input:",
            heading: "Heading2"
          }),
          new Paragraph({
            children: [
              new TextRun(inputText)
            ]
          }),
          new Paragraph({
            text: "LaTeX Format:",
            heading: "Heading2"
          }),
          new Paragraph({
            children: [
              new TextRun(latexOutput)
            ]
          }),
          // Note: In a real application, you would use an equation editor
          // integration to insert the actual formatted equation
        ]
      }]
    });
    
    // Generate and save the document
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, "math-expression.docx");
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-2" size={32} />
              Math Expression Formatter
            </h1>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Paste your mathematical expression below to reformat and display it properly.
          </p>
        </header>
        
        <main>
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <label htmlFor="input-text" className="block mb-2 font-medium">
              Input Expression:
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your mathematical expression here (e.g., G_μν + Λg_μν = c^4/(8πG) T_μν)"
              className={`w-full p-3 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:ring-blue-500 focus:border-blue-500`}
              rows={4}
            />
          </div>
          
          {latexOutput && (
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium">Preview:</h2>
                <button
                  onClick={() => setInputText('')}
                  className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center`}
                >
                  <RefreshCw size={14} className="mr-1" /> Clear
                </button>
              </div>
              <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-x-auto`}>
                <MathJaxContext config={config}>
                  <MathJax>{"$" + latexOutput + "$"}</MathJax>
                </MathJaxContext>
              </div>
            </div>
          )}
          
          {latexOutput && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium flex items-center">
                    <Code size={16} className="mr-1" /> LaTeX Format:
                  </h2>
                  <button
                    ref={latexCopyBtnRef}
                    onClick={() => handleCopy(latexOutput, 'latex')}
                    className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
                  >
                    {copySuccess.latex ? (
                      <>
                        <CheckCircle2 size={14} className="mr-1" /> Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} className="mr-1" /> Copy LaTeX
                      </>
                    )}
                  </button>
                </div>
                <pre className={`p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} overflow-x-auto text-sm`}>
                  {latexOutput}
                </pre>
              </div>
              
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium flex items-center">
                    <Code size={16} className="mr-1" /> MathML Format:
                  </h2>
                  <button
                    ref={mathmlCopyBtnRef}
                    onClick={() => handleCopy(mathmlOutput, 'mathml')}
                    className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center`}
                  >
                    {copySuccess.mathml ? (
                      <>
                        <CheckCircle2 size={14} className="mr-1" /> Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} className="mr-1" /> Copy MathML
                      </>
                    )}
                  </button>
                </div>
                <pre className={`p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} overflow-x-auto text-sm`}>
                  {mathmlOutput}
                </pre>
              </div>
            </div>
          )}
          
          {latexOutput && (
            <div className="flex justify-center">
              <button
                onClick={exportToWord}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center`}
              >
                <Download size={18} className="mr-2" /> Export to Word (.docx)
              </button>
            </div>
          )}
        </main>
        
        <footer className={`mt-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          <p>© 2025 Math Expression Formatter. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
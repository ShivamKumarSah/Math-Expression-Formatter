// This file contains utility functions for processing mathematical expressions

/**
 * Processes a raw mathematical expression into LaTeX format
 * @param input The raw input text
 * @returns Formatted LaTeX string
 */
export const processToLatex = (input: string): string => {
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
  
  // Schrödinger equation
  if (processed.includes('Ψ') && processed.includes('ħ')) {
    processed = processed.replace(/iħ/g, 'i\\hbar');
    processed = processed.replace(/∂Ψ\/∂t/g, '\\frac{\\partial\\Psi}{\\partial t}');
    processed = processed.replace(/∇\^2/g, '\\nabla^{2}');
  }
  
  // Maxwell's equations
  if (processed.includes('∇') && (processed.includes('E') || processed.includes('B'))) {
    processed = processed.replace(/∇\s*\.\s*E/g, '\\nabla \\cdot \\vec{E}');
    processed = processed.replace(/∇\s*\.\s*B/g, '\\nabla \\cdot \\vec{B}');
    processed = processed.replace(/∇\s*×\s*E/g, '\\nabla \\times \\vec{E}');
    processed = processed.replace(/∇\s*×\s*B/g, '\\nabla \\times \\vec{B}');
  }
  
  return processed;
};

/**
 * Detects common patterns in mathematical expressions
 * @param input The raw input text
 * @returns Object with detected patterns
 */
export const detectPatterns = (input: string) => {
  const patterns = {
    hasSubscripts: /([A-Za-z])_([A-Za-z0-9]+)/g.test(input),
    hasSuperscripts: /([A-Za-z0-9])(\^)([A-Za-z0-9]+)/g.test(input),
    hasFractions: /([A-Za-z0-9]+)\/([A-Za-z0-9]+)/g.test(input),
    hasGreekLetters: /[α-ωΑ-Ω]/.test(input),
    isEinsteinEquation: /G.*μν.*Λ.*g.*μν.*T.*μν/g.test(input),
    isSchrodingerEquation: /[Ψψ].*[ħh].*∇\^2/g.test(input),
    isMaxwellEquation: /∇.*[EB].*∇.*[EB]/g.test(input)
  };
  
  return patterns;
};
// This file is maintained for backward compatibility with existing code
// All new code should use the xrayAnalysisService directly

import { analyzeXray } from './xrayAnalysisService';

// Re-export the functions from xrayAnalysisService to maintain compatibility
export { analyzeXray };

// Legacy function names mapped to new implementations
export const analyzeAndSubmit = analyzeXray;
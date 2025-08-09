export type Step = 1 | 2 | 3;

export interface TestResult {
  certifiedLevel: string | null;
  pass: boolean;
  nextStepAllowed: boolean;
  message?: string;
}

export function evaluateTestScore(step: Step, scorePercent: number): TestResult {
  switch (step) {
    case 1:
      if (scorePercent < 25) {
        return {
          certifiedLevel: null,
          pass: false,
          nextStepAllowed: false,
          message: 'Failed Step 1 - No retake allowed',
        };
      } else if (scorePercent < 50) {
        return { certifiedLevel: 'A1', pass: true, nextStepAllowed: false };
      } else if (scorePercent < 75) {
        return { certifiedLevel: 'A2', pass: true, nextStepAllowed: false };
      } else {
        return { certifiedLevel: 'A2', pass: true, nextStepAllowed: true };
      }

    case 2:
      if (scorePercent < 25) {
        return { certifiedLevel: 'A2', pass: false, nextStepAllowed: false };
      } else if (scorePercent < 50) {
        return { certifiedLevel: 'B1', pass: true, nextStepAllowed: false };
      } else if (scorePercent < 75) {
        return { certifiedLevel: 'B2', pass: true, nextStepAllowed: false };
      } else {
        return { certifiedLevel: 'B2', pass: true, nextStepAllowed: true };
      }

    case 3:
      if (scorePercent < 25) {
        return { certifiedLevel: 'B2', pass: false, nextStepAllowed: false };
      } else if (scorePercent < 50) {
        return { certifiedLevel: 'C1', pass: true, nextStepAllowed: false };
      } else {
        return { certifiedLevel: 'C2', pass: true, nextStepAllowed: false };
      }

    default:
      throw new Error('Invalid test step');
  }
}

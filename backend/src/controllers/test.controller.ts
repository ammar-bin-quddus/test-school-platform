import { Request, Response } from 'express';
import TestResult from '../models/TestResult.model';
import { evaluateTestScore, Step } from '../services/testFlow.service';
import { generateAndSendCertificate } from '../services/certificate.service';
import User from '../models/User.model';

export const submitTestStep = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { step, scorePercent } = req.body;

    if (![1, 2, 3].includes(step)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }

    // Find the test result that was started but not completed
    const testResult = await TestResult.findOne({ userId, step, completed: false });
    if (!testResult) {
      return res.status(400).json({ error: 'Test step not started or already submitted' });
    }

    // Calculate allowed time (1 minute per question * number of questions)
    const questionsPerStep = 44; // as per spec
    const timeLimitMs = questionsPerStep * 60 * 1000; // e.g., 44 minutes default

    const now = new Date().getTime();
    const startTime = testResult.startTime.getTime();

    if (now - startTime > timeLimitMs) {
      // Time expired — mark as failed automatically
      testResult.scorePercent = 0;
      testResult.pass = false;
      testResult.certifiedLevel = null;
      testResult.completed = true;
      testResult.endTime = new Date();

      await testResult.save();

      return res.status(400).json({ error: 'Time expired. Test auto-submitted as failed.' });
    }

    // Evaluate test results
    const result = evaluateTestScore(step as Step, scorePercent);

    testResult.scorePercent = scorePercent;
    testResult.pass = result.pass;
    testResult.certifiedLevel = result.certifiedLevel;
    testResult.completed = true;
    testResult.endTime = new Date();

    await testResult.save();

    // If user got a certification level (not null) then generate certificate
    if (result.certifiedLevel) {
      // get user's email
      const user = await User.findById(userId);
      if (user && user.email) {
        const cert = await generateAndSendCertificate({
          userId,
          testResultId: testResult._id as string,
          level: result.certifiedLevel,
          email: user.email,
          sendEmail: true
        });
        return res.status(201).json({ message: 'Test submitted; certificate issued', result, testResult, certificate: cert });
      }
    }

    return res.status(201).json({
      message: 'Test result recorded',
      result,
      testResult,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};


export const startTestStep = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { step } = req.body;

    if (![1, 2, 3].includes(step)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }

    // Check if there's already a running test for this user and step (not completed)
    const existingTest = await TestResult.findOne({ userId, step, completed: false });
    if (existingTest) {
      return res.status(200).json({ message: 'Test step already started', testResultId: existingTest._id, startTime: existingTest.startTime });
    }

    // Create new test result with startTime
    const testResult = await TestResult.create({
      userId,
      step,
      startTime: new Date(),
      completed: false,
    });

    return res.status(201).json({ message: 'Test step started', testResultId: testResult._id, startTime: testResult.startTime });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

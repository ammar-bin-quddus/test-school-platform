import { Request, Response } from 'express';
import Certificate from '../models/Certificate.model';
import User from '../models/User.model';
import path from 'path';
import fs from 'fs';

export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const certId = req.params.id;
    const cert = await Certificate.findById(certId);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    // Only owner or admin can download
    const requester = (req as any).user;
    if (!requester) return res.status(401).json({ error: 'Unauthorized' });

    if (requester.role !== 'admin' && requester.id !== cert.userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filePath = cert.filePath;
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
};

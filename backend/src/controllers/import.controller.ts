import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { importService } from '../services/import.service.js';
import { AuthenticatedRequest } from '../types/index.js';

const stageFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileContentBase64: z.string().min(1, 'Base64 encoded file content is required')
});

const commitImportSchema = z.object({
  validRows: z.array(z.any()).min(1, 'At least one valid row is required')
});

export class ImportController {
  async stageFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = stageFileSchema.parse(req.body);
      const buffer = Buffer.from(validated.fileContentBase64, 'base64');
      const result = await importService.parseAndValidateInvoiceFile(
        buffer,
        validated.fileName,
        req.user!.id
      );
      res.json({
        success: true,
        message: 'File parsed and staged for review',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async commit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = commitImportSchema.parse(req.body);
      const result = await importService.commitImport(validated.validRows, req.user!.id);
      res.json({
        success: true,
        message: `Successfully imported ${result.committedCount} records`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const importController = new ImportController();

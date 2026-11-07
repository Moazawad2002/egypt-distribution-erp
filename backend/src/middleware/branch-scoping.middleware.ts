import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';

export const enforceBranchScope = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' });
    return;
  }

  // CEO and ADMIN have global visibility across all branches
  if (req.user.role === 'CEO' || req.user.role === 'ADMIN') {
    // If CEO explicitly requested a specific branch filter via query param, honor it
    const requestedBranch = (req.query.branchId as string) || (req.body?.branchId as string);
    req.scopedBranchId = requestedBranch || null;
    next();
    return;
  }

  // Branch-restricted roles (BRANCH_MANAGER, INVENTORY_STAFF, SALES_REP, etc.)
  const userBranchId = req.user.branchId;
  if (!userBranchId) {
    res.status(403).json({
      success: false,
      message: 'User account is not assigned to any operational branch'
    });
    return;
  }

  // Check if client tried to manipulate branchId in query, params, or body
  const queryBranch = req.query.branchId as string;
  const paramBranch = req.params.branchId as string;
  const bodyBranch = req.body?.branchId as string;

  if ((queryBranch && queryBranch !== userBranchId) ||
      (paramBranch && paramBranch !== userBranchId) ||
      (bodyBranch && bodyBranch !== userBranchId)) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: You are not authorized to view or modify data for another branch'
    });
    return;
  }

  // Force scope to user's assigned branch
  req.scopedBranchId = userBranchId;
  if (req.body && typeof req.body === 'object') {
    req.body.branchId = userBranchId;
  }

  next();
};

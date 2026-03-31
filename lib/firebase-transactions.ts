import { db } from './firebase';
import { doc, writeBatch } from 'firebase/firestore';

export const processWithdrawalAction = async (withdrawalId: string, transactionId: string, action: 'Approved' | 'Rejected') => {
  const batch = writeBatch(db);
  
  const targetStatus = action === 'Approved' ? 'completed' : 'failed';

  const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
  batch.update(withdrawalRef, { status: targetStatus });

  if (transactionId) {
    const transactionRef = doc(db, 'transactions', transactionId);
    batch.update(transactionRef, { status: targetStatus });
  }
  
  await batch.commit();
};

import { Activity, Approval, Property } from '@/src/models';

export function getPropertyPresentation(property: Property, approval: Approval | undefined, activity: Activity[]) {
  const failedSync = activity.find((item) => item.id === 'act-4');
  const isSandton = property.id === 'sandton-studio';
  const syncLabel = isSandton && failedSync?.retried
    ? 'Retry accepted locally, provider confirmation pending'
    : property.syncLabel;

  const approvalNote = approval && property.id === approval.propertyId
    ? approval.status === 'pending'
      ? `${approval.field} proposal awaiting approval`
      : approval.status === 'approved'
        ? `${approval.field} proposal approved, not published`
        : `${approval.field} proposal ${approval.status}`
    : null;

  return {
    syncHealth: property.syncHealth,
    syncLabel,
    notes: approvalNote ? [...property.baseNotes, approvalNote] : property.baseNotes,
  };
}

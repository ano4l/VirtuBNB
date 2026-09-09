import { ApprovalStatus } from '@/src/models';

const delay = (ms = 650) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const demoService = {
  async decideApproval(_id: string, decision: Exclude<ApprovalStatus, 'pending'>) {
    await delay();
    return { status: decision } as const;
  },
  async completeTask(id: string) {
    await delay(350);
    return { id, status: 'completed' as const };
  },
  async retryActivity(id: string) {
    await delay(700);
    return { id, retried: true };
  },
};

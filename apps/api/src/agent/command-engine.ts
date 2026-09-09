import type { MemoryStore } from "../store/memory-store.js";
import type { WhatsAppInboundMessage } from "../whatsapp/types.js";

export class CommandEngine {
  constructor(private readonly store: MemoryStore) {}

  handle(message: WhatsAppInboundMessage): string {
    if (message.type === "image") return this.handleImage(message.image.id, message.image.caption ?? "");

    const input = message.text.body.trim();
    const normalized = input.toLowerCase();

    if (normalized === "help" || normalized === "menu") {
      return [
        "VirtuHost can help with:",
        "TODAY for your briefing",
        "BOOKINGS for stay activity",
        "TASKS for open work",
        "PROPERTIES for portfolio status",
        "APPROVALS for pending proposals",
        "COMPLETE task_clean_sandton to finish a task",
        "Change Rosebank Loft check-in to 15:00",
        "Description for Rosebank Loft: Your revised description",
        "APPROVE VH-0000 or REJECT VH-0000 for a staged change",
        "You can also send a property photo with the property name in its caption.",
      ].join("\n");
    }

    if (normalized === "today" || normalized.includes("happening today")) {
      return this.store.getDashboard().briefing;
    }

    if (normalized.startsWith("booking")) {
      return "Today has two arrivals and one checkout across your demo portfolio. Reply PROPERTIES for property-level status.";
    }

    if (normalized === "approvals") {
      const pending = this.store.approvals.filter((item) => item.status === "pending" && Date.parse(item.expiresAt) > Date.now());
      return pending.length ? pending.map((item) => `${item.code}: ${item.field}, ${item.before} → ${item.after}. Expires ${item.expiresAt}.`).join("\n").slice(0, 4000) : "No pending approvals.";
    }

    const complete = normalized.match(/^complete\s+(task_[a-z_]+)$/);
    if (complete) {
      const task = this.store.completeTask(complete[1] ?? "");
      return task ? `${task.title} marked complete in the demo workspace.` : "Task not found. Reply TASKS for task IDs.";
    }

    const listing = input.match(/^change\s+(.+?)\s+check-in\s+to\s+(\d{1,2}:\d{2})$/i);
    const description = input.match(/^description\s+for\s+(.+?):\s+([\s\S]+)$/i);
    if (listing || description) {
      const property = this.store.findProperty((listing ?? description)?.[1] ?? "");
      if (!property) return "Specify exactly one property: Rosebank Loft or Sandton Studio.";
      const after = (listing ?? description)?.[2] ?? "";
      if (after.length > 2400) return "Please keep this description under 2,400 characters so the proposal fits in one review message.";
      if (listing && !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(after)) return "Use a valid 24-hour time, such as 15:00.";
      const proposal = this.store.createListingApproval(property, listing ? "Check-in time" : "Description", after);
      return `${property.name}: ${proposal.field}\nBefore: ${proposal.before}\nProposed: ${proposal.after}\nReply APPROVE ${proposal.code} or REJECT ${proposal.code}. Demo only; publication is unavailable.`;
    }

    if (normalized.startsWith("task") || normalized === "show my open tasks") {
      const open = this.store.tasks.filter((task) => task.status !== "completed");
      return open.length
        ? open.map((task) => `${task.id}: ${task.title}, ${task.dueLabel}, assigned to ${task.assignee} (${task.status})`).join("\n")
        : "There are no open tasks.";
    }

    if (normalized.startsWith("propert")) {
      return this.store.properties
        .map((property) => `${property.name}: ${property.status}; ${property.nextStay}; sync ${property.syncStatus}.`)
        .join("\n");
    }

    const decision = normalized.match(/^(approve|reject)\s+(vh-[a-z0-9-]+)$/i);
    if (decision) {
      const action = decision[1]?.toLowerCase() === "approve" ? "approved" : "rejected";
      const approval = this.store.decideApproval(decision[2] ?? "", action);
      if (!approval) return "I could not find a pending approval with that code. Reply HELP for examples.";
      return `${approval.code} was ${action}. This demo recorded the decision but did not change a live listing.`;
    }

    return "I did not recognize that request yet. Reply HELP to see the commands available in this first build.";
  }

  private handleImage(mediaId: string, caption: string): string {
    const property = this.store.findProperty(caption);
    if (!property) {
      return "I received the photo. Please resend it with Rosebank Loft or Sandton Studio in the caption so I can stage it for the correct property.";
    }
    const approval = this.store.createPhotoApproval(property, mediaId);
    return `I recorded the media reference for ${property.name}. The image has not yet been downloaded or validated. Reply APPROVE ${approval.code} or REJECT ${approval.code}. No live listing changes before approval; publishing remains unavailable in this demo.`;
  }
}

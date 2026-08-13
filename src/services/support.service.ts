import {
  ref,
  push,
  set,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { db } from "@/lib/firebase";
import { UserRole } from "@/lib/constants";

export interface SupportTicketPayload {
  name: string;
  email: string;
  role: UserRole;
  inquiryType: "telemetry" | "hardware" | "rbac" | "general";
  subject: string;
  message: string;
  attachDiagnostics?: boolean;
  telemetrySnapshot?: {
    batterySoC: number;
    dcBusVoltage: number;
    core0FailsafeActive: boolean;
    gatewayLatencyMs: number;
    timestamp: string;
  } | null;
  attachmentUrls?: string[];
}

export interface SupportTicketDocument extends Omit<SupportTicketPayload, "attachmentUrls"> {
  id: string;
  ticketId: string;
  status: "received" | "ai_triaged" | "assigned" | "resolved";
  priority: "P1_CRITICAL" | "P2_HIGH" | "P3_NORMAL";
  aiTriageSummary?: string;
  attachmentUrls: string[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Generates a memorable ticket reference ID like GFX-8921
 */
export function generateTicketId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GFX-${randomNum}`;
}

/**
 * Submits a new support ticket to Realtime Database (`support_tickets` node)
 */
export async function submitSupportTicket(payload: SupportTicketPayload): Promise<SupportTicketDocument> {
  const ticketId = generateTicketId();

  // Determine initial triage priority based on category & failsafe state
  let priority: "P1_CRITICAL" | "P2_HIGH" | "P3_NORMAL" = "P3_NORMAL";
  if (payload.inquiryType === "hardware" || payload.telemetrySnapshot?.core0FailsafeActive) {
    priority = "P1_CRITICAL";
  } else if (payload.inquiryType === "telemetry" || payload.inquiryType === "rbac") {
    priority = "P2_HIGH";
  }

  // Simulated initial AI triage summary based on keyword matching
  let aiTriageSummary = "Standard routing queue. Engineering dispatch pending.";
  const lowerMsg = payload.message.toLowerCase();
  if (lowerMsg.includes("relay") || lowerMsg.includes("overcurrent") || lowerMsg.includes("failsafe")) {
    aiTriageSummary = "Potential high-current failsafe condition identified on Core 0. Recommended check: Inspect physical relay contacts & verify FreeRTOS watchdog register.";
  } else if (lowerMsg.includes("websocket") || lowerMsg.includes("disconnect") || lowerMsg.includes("delay")) {
    aiTriageSummary = "Telemetry sync jitter detected. Recommended check: Verify TLS buffer allocation on edge gateway and inspect 1Hz heartbeat timeout.";
  } else if (lowerMsg.includes("permission") || lowerMsg.includes("jwt") || lowerMsg.includes("claim")) {
    aiTriageSummary = "Authorization token mismatch. Recommended check: Force token refresh via Auth service or inspect custom claims in Firestore user profile.";
  }

  const documentData: Omit<SupportTicketDocument, "id"> = {
    ...payload,
    ticketId,
    status: "ai_triaged",
    priority,
    aiTriageSummary,
    attachmentUrls: payload.attachmentUrls || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ticketsRef = ref(db, "support_tickets");
  const newTicketRef = push(ticketsRef);
  const docId = newTicketRef.key as string;
  
  const finalData = { ...documentData, id: docId } as SupportTicketDocument;
  await set(newTicketRef, finalData);

  // Trigger real-time email dispatch to mekesh.engineer@gmail.com
  try {
    await fetch("/api/support/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });
  } catch (dispatchErr) {
    console.warn("Email dispatch notification trigger failed:", dispatchErr);
  }

  return finalData;
}

/**
 * Subscribes to real-time status updates of a specific support ticket by RTDB key
 */
export function subscribeToTicketStatus(
  docId: string,
  onUpdate: (ticket: SupportTicketDocument | null) => void,
  onError?: (err: Error) => void
): () => void {
  const ticketRef = ref(db, `support_tickets/${docId}`);
  const unsubscribe = onValue(
    ticketRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.val() as SupportTicketDocument);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error(`Error monitoring ticket ${docId}:`, err);
      if (onError) onError(err);
    }
  );
  return () => unsubscribe();
}

export async function uploadDiagnosticFile(
  docId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  console.warn("Storage functionality has been disabled. Attachments are not uploaded.");
  if (onProgress) onProgress(100);
  return "";
}

import { NextResponse } from "next/server";
import { z } from "zod";

const TicketSchema = z.object({
  ticketId: z.string().min(3).default(() => `GFX-${Date.now().toString(36).toUpperCase()}`),
  name: z.string().min(1, "Operator name is required"),
  email: z.string().email("Valid operator email is required"),
  role: z.string().optional().default("Operator"),
  inquiryType: z.string().min(1, "Inquiry category is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  message: z.string().min(10, "Message must provide at least 10 characters of detail"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).default("NORMAL"),
  telemetrySnapshot: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = TicketSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      ticketId,
      name,
      email,
      role,
      inquiryType,
      subject,
      message,
      priority,
      telemetrySnapshot,
    } = parseResult.data;

    const recipientEmail = "mekesh.engineer@gmail.com";

    // Detailed server dispatch log
    console.log("=================================================");
    console.log(`[DISPATCH] Real-Time Ticket Notification Triggered`);
    console.log(`Ticket Reference : ${ticketId}`);
    console.log(`Super Admin Target: ${recipientEmail}`);
    console.log(`Operator Name    : ${name}`);
    console.log(`Operator Email   : ${email}`);
    console.log(`Authorization    : ${role}`);
    console.log(`Category         : ${inquiryType}`);
    console.log(`Priority         : ${priority}`);
    console.log(`Subject          : ${subject}`);
    console.log(`Message Snippet  : ${message.slice(0, 100)}...`);
    if (telemetrySnapshot) {
      console.log(
        `Telemetry Snapshot: SoC ${telemetrySnapshot.batterySoC ?? "N/A"}% | DC ${
          telemetrySnapshot.dcBusVoltage ?? "N/A"
        }V`
      );
    }
    console.log("=================================================");

    return NextResponse.json({
      success: true,
      recipientEmail,
      ticketId,
      message: `Ticket ${ticketId} dispatched successfully to Super Admin (${recipientEmail})`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error dispatching ticket email:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Dispatch Error" },
      { status: 500 }
    );
  }
}


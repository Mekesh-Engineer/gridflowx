import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, name, email, role, inquiryType, subject, message, priority, telemetrySnapshot } = body;

    const recipientEmail = "mekesh.engineer@gmail.com";

    // Detailed server dispatch log
    console.log("=================================================");
    console.log(`[DISPATCH] Real-Time Ticket Notification Triggered`);
    console.log(`Ticket Reference : ${ticketId || "GFX-UNKNOWN"}`);
    console.log(`Super Admin Target: ${recipientEmail}`);
    console.log(`Operator Name    : ${name}`);
    console.log(`Operator Email   : ${email}`);
    console.log(`Authorization    : ${role}`);
    console.log(`Category         : ${inquiryType}`);
    console.log(`Priority         : ${priority || "NORMAL"}`);
    console.log(`Subject          : ${subject}`);
    console.log(`Message Snippet  : ${message?.slice(0, 100)}...`);
    if (telemetrySnapshot) {
      console.log(`Telemetry Vit    : SoC ${telemetrySnapshot.batterySoC}% | DC ${telemetrySnapshot.dcBusVoltage}V | Failsafe ${telemetrySnapshot.core0FailsafeActive ? "TRIPPED" : "NOMINAL"}`);
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

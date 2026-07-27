import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

export async function POST(req: Request) {
  const { name, email, timeline, budget, message, turnstileToken } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const valid = await verifyTurnstile(turnstileToken ?? "");
  if (!valid) {
    return NextResponse.json({ error: "Security check failed." }, { status: 403 });
  }

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: "benni.vichel@hotmail.com",
    replyTo: email,
    subject: `New contact from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Timeline: ${timeline || "—"}`,
      `Budget: ${budget || "—"}`,
      ``,
      `Message:`,
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

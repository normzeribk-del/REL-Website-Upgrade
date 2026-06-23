import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactSubmission {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  project_type: string;
  message: string;
  preferred_contact?: string;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  civil: "Civil Engineering",
  transport: "Transport & Infrastructure",
  structural: "Structural Engineering",
  environmental: "Environmental & Utilities",
  "project-management": "Project Management & Advisory",
  feasibility: "Feasibility Study",
  capability: "Capability Statement Request",
  other: "Other / General Enquiry",
};

async function sendEmailNotification(
  submission: ContactSubmission & { id: string },
  supabase: ReturnType<typeof createClient>
) {
  const projectTypeLabel = PROJECT_TYPE_LABELS[submission.project_type] ?? submission.project_type;
  const preferredContact = submission.preferred_contact ?? "email";

  const { data: recipients, error: recipientsError } = await supabase
    .from("notification_recipients")
    .select("email")
    .eq("active", true);

  if (recipientsError || !recipients || recipients.length === 0) {
    throw new Error(recipientsError?.message ?? "No active notification recipients found");
  }

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2b4a;">
      <div style="background:#003580;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h2 style="color:#ffffff;margin:0;font-size:1.2rem;">New Contact Form Submission</h2>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:0.85rem;">Rumbam Engineers Limited — rumbamengineers.com</p>
      </div>
      <div style="background:#f8fafc;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;width:160px;color:#64748b;font-size:0.85rem;">Name</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${submission.first_name} ${submission.last_name}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b;font-size:0.85rem;">Email</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><a href="mailto:${submission.email}" style="color:#0066cc;">${submission.email}</a></td></tr>
          ${submission.phone ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b;font-size:0.85rem;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><a href="tel:${submission.phone}" style="color:#0066cc;">${submission.phone}</a></td></tr>` : ""}
          ${submission.company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b;font-size:0.85rem;">Company</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${submission.company}</td></tr>` : ""}
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b;font-size:0.85rem;">Service Type</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${projectTypeLabel}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#64748b;font-size:0.85rem;">Preferred Contact</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-transform:capitalize;">${preferredContact}</td></tr>
        </table>
        <div style="margin-top:20px;">
          <div style="font-weight:600;color:#64748b;font-size:0.85rem;margin-bottom:8px;">Message</div>
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:16px;line-height:1.6;white-space:pre-wrap;">${submission.message}</div>
        </div>
        <div style="margin-top:20px;padding:12px 16px;background:#eff6ff;border-radius:6px;font-size:0.8rem;color:#64748b;">
          Submission ID: ${submission.id}
        </div>
      </div>
    </div>
  `;

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: Deno.env.get("SMTP_USER")!,
        password: Deno.env.get("SMTP_PASS")!,
      },
    },
  });

  const mailOptions = {
    from: Deno.env.get("SMTP_USER")!,
    subject: `New Enquiry: ${submission.first_name} ${submission.last_name} — ${projectTypeLabel}`,
    html: htmlBody,
  };

  for (const recipient of recipients) {
    await client.send({ ...mailOptions, to: recipient.email });
  }

  await client.close();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: ContactSubmission = await req.json();

    if (!body.first_name || !body.last_name || !body.email || !body.project_type || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        project_type: body.project_type,
        message: body.message,
        preferred_contact: body.preferred_contact || "email",
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit contact form" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      await sendEmailNotification({ ...body, id: data.id }, supabase);
      await supabase
        .from("contact_submissions")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", data.id);
    } catch (emailErr) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error("Email notification failed:", errMsg);
      await supabase
        .from("contact_submissions")
        .update({ email_sent: false, email_error: errMsg })
        .eq("id", data.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your message! We will be in touch within one business day.",
        id: data.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

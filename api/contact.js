const CONTACT_EMAIL = process.env.CONTACT_TO_EMAIL || "geotestengineering.ks@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL;

const clean = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!process.env.RESEND_API_KEY || !FROM_EMAIL) {
    response.status(503).json({ error: "Contact email delivery is not configured." });
    return;
  }

  const body = request.body || {};
  if (clean(body.website, 200)) {
    response.status(200).json({ ok: true });
    return;
  }

  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1500) {
    response.status(400).json({ error: "Please wait a moment and try again." });
    return;
  }

  const submission = {
    name: clean(body.name, 120),
    email: clean(body.email, 180).toLowerCase(),
    phone: clean(body.phone, 60),
    location: clean(body.location, 240),
    message: clean(body.message, 5000),
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!submission.name || !emailPattern.test(submission.email) || !submission.phone || !submission.message) {
    response.status(400).json({ error: "Please complete all required fields correctly." });
    return;
  }

  const text = [
    "New GEOtest website request",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone}`,
    `Project location: ${submission.location || "Not provided"}`,
    "",
    "Project details:",
    submission.message,
  ].join("\n");
  const html = `
    <h1>New GEOtest website request</h1>
    <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(submission.phone)}</p>
    <p><strong>Project location:</strong> ${escapeHtml(submission.location || "Not provided")}</p>
    <h2>Project details</h2>
    <p style="white-space: pre-wrap">${escapeHtml(submission.message)}</p>
  `;

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: submission.email,
        subject: `Website request from ${submission.name}`,
        text,
        html,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Contact email provider error:", emailResponse.status, await emailResponse.text());
      response.status(502).json({ error: "The request could not be delivered right now." });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact email delivery failed:", error);
    response.status(502).json({ error: "The request could not be delivered right now." });
  }
}

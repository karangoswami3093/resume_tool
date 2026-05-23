import { ResumeData } from "@/types";

export function generateResumeHTML(resumeData: ResumeData): string {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = resumeData;

  const contactParts = [
    personalInfo.location,
    personalInfo.linkedin
      ? `<a href="${personalInfo.linkedin}" style="color:#1155cc;text-decoration:none;">LinkedIn</a>`
      : null,
    personalInfo.github
      ? `<a href="${personalInfo.github}" style="color:#1155cc;text-decoration:none;">GitHub</a>`
      : null,
    personalInfo.email
      ? `<a href="mailto:${personalInfo.email}" style="color:#1155cc;text-decoration:none;">${personalInfo.email}</a>`
      : null,
    personalInfo.phone || null,
  ]
    .filter(Boolean)
    .join(' <span style="color:#666;margin:0 1px;">|</span> ');

  const sectionHeader = `
    font-family: Calibri, Arial, sans-serif;
    font-size: 11pt;
    font-weight: bold;
    border-bottom: 1.5px solid #000;
    padding-bottom: 1px;
    margin-top: 10px;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  `;

  const skillsHTML = skills
    .map(
      (cat) =>
        `<li style="margin-bottom:2px;"><span style="font-weight:700;">${escapeHtml(cat.category)}:</span> ${escapeHtml(cat.items.join(", "))}</li>`
    )
    .join("\n");

  const experienceHTML = experience
    .map(
      (exp) => `
      <div style="margin-bottom:7px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-weight:700;font-size:10.5pt;padding:0;">${escapeHtml(exp.role)}, ${escapeHtml(exp.company)}${exp.location ? `, ${escapeHtml(exp.location)}` : ""}</td>
            <td style="font-weight:700;font-size:10.5pt;text-align:right;white-space:nowrap;padding:0;">${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}</td>
          </tr>
        </table>
        <ul style="margin:3px 0 0 0;padding-left:16px;">
          ${exp.bullets.map((b) => `<li style="margin-bottom:2px;">${escapeHtml(b)}</li>`).join("\n")}
        </ul>
      </div>`
    )
    .join("\n");

  const educationHTML = education
    .map(
      (edu) => `
      <div style="margin-bottom:5px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-weight:700;font-size:10.5pt;padding:0;">${escapeHtml(edu.institution)}</td>
            <td style="font-weight:700;font-size:10.5pt;text-align:right;white-space:nowrap;padding:0;">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</td>
          </tr>
        </table>
        <div style="font-size:10.5pt;">${escapeHtml(edu.degree)}${edu.field ? ` in ${escapeHtml(edu.field)}` : ""}</div>
      </div>`
    )
    .join("\n");

  const projectsHTML =
    projects && projects.length > 0
      ? `
      <div style="${sectionHeader}">Academic Projects</div>
      ${projects
        .map(
          (proj) => `
          <div style="margin-bottom:6px;">
            <div style="font-weight:700;font-size:10.5pt;">${escapeHtml(proj.name)}${proj.organization ? `, ${escapeHtml(proj.organization)}` : ""}</div>
            <ul style="margin:3px 0 0 0;padding-left:16px;">
              ${proj.bullets.map((b) => `<li style="margin-bottom:2px;">${escapeHtml(b)}</li>`).join("\n")}
            </ul>
          </div>`
        )
        .join("\n")}`
      : "";

  const certificationsHTML =
    certifications && certifications.length > 0
      ? `
      <div style="${sectionHeader}">Certifications</div>
      <ul style="margin:3px 0;padding-left:16px;">
        ${certifications
          .map(
            (c) =>
              `<li style="margin-bottom:2px;"><strong>${escapeHtml(c.name)}</strong>${c.issuer ? `, ${escapeHtml(c.issuer)}` : ""}${c.status === "pursuing" ? " <em>(Pursuing)</em>" : ""}</li>`
          )
          .join("\n")}
      </ul>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    font-family: Calibri, Arial, sans-serif;
    font-size: 10.5pt;
    color: #000;
    background: #fff;
    -webkit-print-color-adjust: exact;
  }
  body {
    padding: 0.55in 0.6in 0.5in 0.6in;
    line-height: 1.35;
  }
  a { color: #1155cc; text-decoration: none; }
  ul { list-style-type: disc; }
  li { font-size: 10.5pt; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  @page {
    size: letter;
    margin: 0;
  }
</style>
</head>
<body>

<!-- Header -->
<div style="text-align:center;margin-bottom:8px;">
  <div style="font-size:19pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:3px;">
    ${escapeHtml(personalInfo.name || "YOUR NAME")}
  </div>
  <div style="font-size:9.5pt;color:#111;line-height:1.4;">
    ${contactParts}
  </div>
</div>

${summary ? `
<!-- Summary -->
<div style="${sectionHeader}">Summary</div>
<p style="font-size:10.5pt;margin-bottom:4px;">${escapeHtml(summary)}</p>
` : ""}

${skills.length > 0 ? `
<!-- Skills -->
<div style="${sectionHeader}">Skills:</div>
<ul style="margin:3px 0;padding-left:16px;list-style-type:disc;">
  ${skillsHTML}
</ul>
` : ""}

${experience.length > 0 ? `
<!-- Experience -->
<div style="${sectionHeader}">Experience:</div>
${experienceHTML}
` : ""}

${education.length > 0 ? `
<!-- Education -->
<div style="${sectionHeader}">Education:</div>
${educationHTML}
` : ""}

${projectsHTML}
${certificationsHTML}

</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/—/g, "-") // em dash to hyphen
    .replace(/–/g, "-") // en dash to hyphen (dates use explicit " - " via template)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateResumePDF(resumeData: ResumeData): Promise<Buffer> {
  const puppeteer = await import("puppeteer");
  const html = generateResumeHTML(resumeData);

  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set a fixed viewport matching US Letter at 96dpi
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Wait for fonts to settle
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: false,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

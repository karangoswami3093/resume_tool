"use client";

import { ResumeData } from "@/types";

interface ResumeTemplateProps {
  data: ResumeData;
  scale?: number;
}

export default function ResumeTemplate({ data, scale = 1 }: ResumeTemplateProps) {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

  const contactParts = [
    personalInfo.location,
    personalInfo.linkedin ? (
      <a key="li" href={personalInfo.linkedin} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    ) : null,
    personalInfo.github ? (
      <a key="gh" href={personalInfo.github} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    ) : null,
    personalInfo.email ? (
      <a key="email" href={`mailto:${personalInfo.email}`} className="text-blue-700 hover:underline">
        {personalInfo.email}
      </a>
    ) : null,
    personalInfo.phone,
  ].filter(Boolean);

  const sectionHeader = "font-bold border-b border-black pb-0.5 mt-3 mb-1.5 text-[11pt] tracking-wide uppercase";
  const bulletList = "ml-4 list-disc space-y-0.5";

  return (
    <div
      className="bg-white text-black font-[Calibri,Arial,sans-serif] leading-snug"
      style={{
        width: "816px",
        minHeight: "1056px",
        padding: "40px 43px",
        fontSize: "10.5pt",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        fontFamily: "'Calibri', 'Arial', sans-serif",
      }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="font-bold uppercase tracking-widest" style={{ fontSize: "20pt" }}>
          {personalInfo.name || "YOUR NAME"}
        </h1>
        <div className="text-[9.5pt] mt-0.5 flex flex-wrap justify-center gap-x-1.5 items-center">
          {contactParts.map((part, i) => (
            <span key={i} className="flex items-center gap-x-1.5">
              {i > 0 && <span className="text-gray-500">|</span>}
              {part}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <>
          <div className={sectionHeader}>Summary</div>
          <p className="text-[10.5pt] leading-snug">{summary}</p>
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <div className={sectionHeader}>Skills:</div>
          <ul className={bulletList}>
            {skills.map((cat, i) => (
              <li key={i} className="text-[10.5pt]">
                <span className="font-bold">{cat.category}:</span>{" "}
                {cat.items.join(", ")}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <div className={sectionHeader}>Experience:</div>
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10.5pt]">
                    {exp.role} – {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
                  </span>
                  <span className="font-bold text-[10.5pt] whitespace-nowrap ml-2">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className={`${bulletList} mt-0.5`}>
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-[10.5pt]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <div className={sectionHeader}>Education:</div>
          <div className="space-y-1.5">
            {education.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10.5pt]">{edu.institution}</span>
                  <span className="font-bold text-[10.5pt] whitespace-nowrap ml-2">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <div className="text-[10.5pt]">
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Academic Projects */}
      {projects && projects.length > 0 && (
        <>
          <div className={sectionHeader}>Academic Projects</div>
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={i}>
                <span className="font-bold text-[10.5pt]">
                  {proj.name}
                  {proj.organization ? ` – ${proj.organization}` : ""}
                </span>
                {proj.bullets.length > 0 && (
                  <ul className={`${bulletList} mt-0.5`}>
                    {proj.bullets.map((bullet, j) => (
                      <li key={j} className="text-[10.5pt]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <>
          <div className={sectionHeader}>Certifications</div>
          <ul className={bulletList}>
            {certifications.map((cert, i) => (
              <li key={i} className="text-[10.5pt]">
                <span className="font-bold">{cert.name}</span>
                {cert.issuer ? ` – ${cert.issuer}` : ""}
                {cert.status === "pursuing" ? " (Pursuing)" : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

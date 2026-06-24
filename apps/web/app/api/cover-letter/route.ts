import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const premiumRes = await fetch(`${process.env.API_URL}/api/premium/status`, {
    headers: { "X-Clerk-User-Id": userId },
  });
  const premiumData = (await premiumRes.json()) as { data: { isPremium: boolean } };
  if (!premiumData.data?.isPremium) {
    return Response.json({ error: "Premium required" }, { status: 403 });
  }

  const { jobTitle, company, jobDescription, userSkills, userExperience } =
    (await req.json()) as {
      jobTitle: string;
      company: string;
      jobDescription: string;
      userSkills: string[];
      userExperience: number;
    };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "AI not configured" }, { status: 503 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Write a concise, professional cover letter for this remote job application. The applicant is based in India.

Job: ${jobTitle} at ${company}
Job description excerpt: ${jobDescription.slice(0, 800)}
Applicant skills: ${userSkills.join(", ")}
Years of experience: ${userExperience}

Write a 3-paragraph cover letter (opening, skills match, closing). Be specific, not generic. Mention the company by name. Keep it under 250 words. Do not include date, address, or "Dear Hiring Manager" boilerplate — start directly with the first paragraph.`,
        },
      ],
    }),
  });

  if (!res.ok) return Response.json({ error: "AI generation failed" }, { status: 502 });

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  const text = data.content[0]?.type === "text" ? data.content[0].text : "";
  return Response.json({ coverLetter: text });
}

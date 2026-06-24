import type { Metadata } from "next";
import { SalarySubmitClient } from "./salary-submit-client";

export const metadata: Metadata = {
  title: "Submit Your Salary | RemoteForge",
  description:
    "Anonymously share your remote salary to help Indian professionals benchmark their worth.",
};

export default function SalarySubmitPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Submit Your Salary</h1>
      <p className="mt-2 text-muted-foreground">
        Help the Indian remote work community by sharing your anonymous salary
        data. Every submission improves benchmarks for everyone.
      </p>
      <SalarySubmitClient apiUrl={apiUrl} />
    </div>
  );
}

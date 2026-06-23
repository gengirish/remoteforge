import type { Metadata } from "next";
import type { GigPlatform, Job } from "@intelliforge/db";

export function jobMetadata(job: Job): Metadata {
  return {
    title: `${job.title} at ${job.company} | RemoteForge`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: `${job.title} — Remote Job`,
      description: `${job.company} · ${job.location}`,
    },
  };
}

export function gigMetadata(platform: GigPlatform): Metadata {
  return {
    title: `${platform.name} Review: Pay, India Eligibility | RemoteForge`,
    description: platform.description.slice(0, 160),
    openGraph: {
      title: `${platform.name} — AI Gig Platform`,
      description: platform.indiaAccepted
        ? "Open to India"
        : "Not available in India",
    },
  };
}

export function jobsListingMetadata(): Metadata {
  return {
    title: "Remote Jobs for India 2026 | RemoteForge",
    description:
      "Browse remote jobs open to India. Engineering, design, marketing and more.",
  };
}

export function gigsListingMetadata(): Metadata {
  return {
    title: "AI Data Annotation & RLHF Jobs India 2026 | RemoteForge",
    description:
      "Compare AI gig platforms — pay, India eligibility, onboarding time. Outlier, Appen, TELUS and more.",
  };
}

export function jobJsonLd(job: Job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: new Date(job.postedAt).toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "IN" },
    },
    employmentType: "FULL_TIME",
    workHours: "Remote",
  };
}

export function gigJsonLd(platform: GigPlatform) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: `${platform.name} — AI Gig Work`,
    description: platform.description,
    hiringOrganization: {
      "@type": "Organization",
      name: platform.name,
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: platform.payMin / 100,
        maxValue: platform.payMax / 100,
        unitText: "HOUR",
      },
    },
  };
}

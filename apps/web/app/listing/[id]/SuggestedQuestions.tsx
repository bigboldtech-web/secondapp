"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startChat, sendMessage } from "@/app/inbox/actions";

interface SuggestedQuestionsProps {
  listingId: string;
  productName: string;
  categorySlug: string;
  condition: string;
  specs: Record<string, string>;
  vendorName: string;
}

function generateQuestions(props: SuggestedQuestionsProps): string[] {
  const { categorySlug, condition, specs, productName } = props;
  const questions: string[] = [];

  // Universal
  questions.push(`Is the ${productName} still available?`);

  // Condition-specific
  if (condition === "Good" || condition === "Rough") {
    questions.push("Can you share more photos of any scratches or damage?");
  }
  if (condition === "Like New" || condition === "Excellent") {
    questions.push("How old is this device and how much was it used?");
  }

  // Category-specific
  if (categorySlug === "phones" || categorySlug === "tablets") {
    questions.push("What is the battery health percentage?");
    questions.push("Does it come with original charger and box?");
    if (specs.storage) questions.push(`Is the ${specs.storage} storage the actual usable amount?`);
  }
  if (categorySlug === "laptops" || categorySlug === "macbooks") {
    questions.push("How many charge cycles does the battery have?");
    questions.push("Are there any dead pixels on the screen?");
    if (specs.processor) questions.push(`Any throttling issues with the ${specs.processor}?`);
  }
  if (categorySlug === "cars") {
    questions.push("Can I see the full service history?");
    questions.push("Are there any insurance claims on this vehicle?");
    questions.push("Is the price negotiable?");
    if (specs.kmDriven) questions.push("Is the odometer reading genuine?");
  }
  if (categorySlug === "bikes") {
    questions.push("Any modifications done to the bike?");
    questions.push("When was the last service?");
  }
  if (categorySlug === "gaming") {
    questions.push("How many hours of use does it have?");
    questions.push("Does it come with any games or controllers?");
  }

  // Pricing
  questions.push("Is the price negotiable?");
  questions.push("Can you do a video call to show the product?");

  // Deduplicate and limit
  return [...new Set(questions)].slice(0, 6);
}

export default function SuggestedQuestions(props: SuggestedQuestionsProps) {
  const router = useRouter();
  const [sending, setSending] = useState<string | null>(null);

  const questions = generateQuestions(props);

  const askQuestion = async (question: string) => {
    setSending(question);
    const chatResult = await startChat(props.listingId);
    if (chatResult.error) {
      router.push("/login");
      return;
    }
    if (chatResult.chatId) {
      await sendMessage(chatResult.chatId, question);
      router.push(`/inbox/${chatResult.chatId}`);
    }
    setSending(null);
  };

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-text-secondary mb-2">Suggested questions</p>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => askQuestion(q)}
            disabled={sending !== null}
            className={`text-[11px] px-2.5 py-1.5 rounded-full border cursor-pointer transition-colors ${
              sending === q
                ? "bg-coral text-white border-coral"
                : "bg-white border-border text-text-secondary hover:bg-coral-light hover:border-coral-border hover:text-coral"
            } disabled:opacity-60`}
          >
            {sending === q ? "Opening chat…" : q}
          </button>
        ))}
      </div>
    </div>
  );
}

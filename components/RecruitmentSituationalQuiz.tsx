"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldAlert } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  dept: "ops" | "media" | "spons";
}

interface QuizProps {
  activeCandidate: Candidate;
  quizFinished: boolean;
  setQuizFinished: (f: boolean) => void;
  round1Passed: boolean;
  setRound1Passed: (p: boolean) => void;
  setCurrentRound: (r: 1 | 2) => void;
}

export default function RecruitmentSituationalQuiz({
  activeCandidate,
  quizFinished,
  setQuizFinished,
  round1Passed,
}: QuizProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All 30 Universal CAT-Style Questions
  const quizQuestions = [
    { q: 'In the startup world, what does the term "Unicorn" refer to?', options: ["A startup that has a mythical business model", "A privately held startup company valued at over $1 billion", "A founder who has successfully exited three companies", "A startup that is profitable in its first year"] },
    { q: '[Situation] You and your friend have an idea for a product but zero budget for marketing. What is the best "Guerilla Marketing" tactic to start with?', options: ["Wait until you get funding to run Facebook ads", "Rely solely on organic SEO which takes 6 months", "Create a controversial or highly relatable reel and DM it to bigger startup pages", "Print 10,000 flyers and distribute them outside colleges"] },
    { q: 'An investor asks your team, "What is your Moat?" What are they asking for?', options: ["Your exit strategy", "Your competitive advantage that protects your market share", "The amount of money you have burned in the last month", "The number of co-founders in your team"] },
    { q: 'What does the startup metric "CAC" stand for?', options: ["Customer Acquisition Cost", "Capital Asset Calculation", "Cumulative Annual Growth", "Customer Action Cycle"] },
    { q: '[Situation] You are building a B2B SaaS product. Your first 5 clients are asking for custom features, which is delaying your main product launch. What should you do?', options: ["Build exactly what they ask; the customer is always right", "Stop talking to customers until the product is perfectly finished", "Identify common requests among all 5 to build into the core, and politely decline the unique ones", "Charge them exorbitant amounts of money for custom features"] },
    { q: 'If a startup\'s "Runway" is 6 months, what does that mean?', options: ["They have 6 months before their product launches", "They have 6 months before they run out of money and go bankrupt", "They have a 6-month head start on their competitors", "Their employees are bound by a 6-month contract"] },
    { q: '[Situation] You edited a fantastic 60-second reel for an upcoming E-Cell event, but it’s barely getting any views. What is the most likely mistake?', options: ["The video is 60 seconds instead of 30 seconds", "The \"hook\" in the first 3 seconds wasn't engaging enough to stop the scroll", "You used too many hashtags", "The music wasn't copyrighted"] },
    { q: 'When designing a poster for a serious "Investor Pitch" event, which design approach is best?', options: ["Neon colors, flashy gradients, and 5 different fonts to look \"startup-y\"", "Minimalist design, lots of white space, and clean, professional typography", "A giant meme in the center with event details in small text at the bottom", "Dark mode background with barely visible grey text"] },
    { q: 'Which of these tools is most efficient for a team to collaborate simultaneously on designing an event flyer?', options: ["MS Paint", "Adobe Photoshop (Desktop only)", "Canva (with shared links/editing)", "Apple Notes"] },
    { q: '[Situation] A high-profile speaker for your flagship event cancels 2 hours before the event. You already posted an Instagram story announcing them. How do you handle the Media vertical?', options: ["Delete the story and pretend it never happened", "Post an urgent story apologizing, announcing the change, and hyping up the replacement/next segment", "Go offline for the day to avoid the heat", "Blame the Operations team on the public story"] },
    { q: 'What is the primary purpose of using a "Call to Action" (CTA) in an event post?', options: ["To show off your graphic design skills", "To tell the audience exactly what to do next (e.g., \"Link in bio to register\")", "To increase the word count of the caption", "To make the post look longer and more professional"] },
    { q: '[Situation] You want to take aesthetic, "Insta-worthy" photos of your E-Cell event. The venue lighting is terrible (yellow tube lights). What do you do?', options: ["Use harsh flash on everyone's faces", "Ask people to come outside in the sun for photos", "Use natural light from windows or use a phone app to adjust white balance/kelvin settings", "Just put a black and white filter on everything to hide the bad lighting"] },
    { q: '[Situation] You need to send a cold email to a CEO asking them to judge a startup competition. Which subject line is most likely to get opened?', options: ["Please judge our event", "Opportunity for [Company Name]", "Invitation to be a Chief Guest at [College Name] E-Cell Event", "Hey"] },
    { q: 'You are sending a bulk email to 500 students who registered for a workshop. What is the crucial technical step you MUST take?', options: ["Write the email in all caps so it stands out", "Put all 500 emails in the \"To:\" field", "Put the emails in the \"BCC:\" field to protect privacy and avoid spam flags", "Attach a 50MB PDF brochure to the email"] },
    { q: '[Situation] You booked a projector for an event, but when you arrive, the IT room is locked and the guy with the key is on leave. The event starts in 15 minutes. What is your immediate operational move?', options: ["Cancel the event", "Argue with the college administration right then and there", "Improvise by turning it into an interactive discussion/whiteboard, while sending someone to find an alternative", "Ask the audience to come back tomorrow"] },
    { q: 'What is the best tool to track which team member is doing which task for an upcoming fest?', options: ["A WhatsApp group with sticky messages", "Trello, Notion, or Asana", "Writing it on a piece of paper and losing it", "GroupMe"] },
    { q: '[Situation] 200 people registered on your Google Form for a webinar, but only 40 actually showed up. How do Operations fix this for the next event?', options: ["Stop doing online events", "Implement a 3-step communication flow: Confirmation email, 24-hour reminder, and 1-hour WhatsApp broadcast", "Call every single registrant individually 5 minutes before the event", "Make the Google Form longer so only serious people fill it"] },
    { q: 'You are tasked with managing the "Hospitality" vertical under Ops. What does this entail?', options: ["Designing the welcome banner", "Ensuring speakers have water, their mics are working, they know the schedule, and are escorted on/off stage", "Booking the DJ for the after-party", "Managing the E-Cell’s Instagram DMs"] },
    { q: 'In the context of startups, what does "MVP" stand for?', options: ["Minimum Viable Product", "Most Valuable Player", "Maximum Volume Profit", "Mobile Virtual Platform"] },
    { q: '[Situation] Your custom-built E-Cell event registration website crashes 10 minutes before the deadline because too many people are trying to register. What is your immediate tech fix?', options: ["Shut down the server completely", "Switch to a Google Form link immediately and post it on your social media/WhatsApp groups", "Try to rewrite the entire backend code in 10 minutes", "Tell people to wait and keep refreshing"] },
    { q: 'A non-tech founder wants to build a basic app for college students to buy and sell second-hand books. They have no coding knowledge and no money to hire developers. What should they do?', options: ["Give up on the idea", "Learn Java and Android Studio from scratch (takes 6 months)", "Use No-Code tools like Bubble, Glide, or FlutterFlow", "Just make a WhatsApp group"] },
    { q: '[Situation] You are hosting a live Zoom webinar with an external speaker. Midway through, the speaker\'s internet cuts out and they freeze. As the tech host, what do you do?', options: ["End the stream immediately", "Panic and stay silent on the mic", "Mute the frozen speaker, take over the mic, explain the tech glitch, and play a filler Q&A until they return", "Start typing aggressively in the chat"] },
    { q: 'Which of the following is a modern use of AI that an E-Cell can use to save time in Operations/Media?', options: ["Using ChatGPT to draft initial sponsorship emails or social media captions", "Using AI to physically set up the chairs in the auditorium", "Using AI to force people to attend events", "Using AI to hack into the college server for extra bandwidth"] },
    { q: 'What is the primary difference between a "Native App" and a "Web App"?', options: ["Native apps are downloaded from app stores; Web apps run on browsers", "Native apps only work on iPhones; Web apps only work on Androids", "Web apps are faster than Native apps", "There is no difference, it’s just marketing jargon"] },
    { q: '[Situation] You are hosting a panel discussion. The crowd looks bored, and half of them are on their phones. How do you "read the room" and fix it?', options: ["Ignore the crowd and let the speakers keep talking monotonously", "Yell at the crowd to put their phones away", "Pause the discussion, throw a witty, relatable joke, and ask the audience a direct, polarizing question", "Start singing to wake them up"] },
    { q: 'What is the most important skill for an "Influencer-type" college host?', options: ["Knowing every single fact about the speakers", "Having a deep baritone voice", "Improvisation and the ability to handle live, unexpected situations smoothly", "Wearing a suit"] },
    { q: '[Situation] A guest speaker makes a joke on stage that falls completely flat, and the room goes awkwardly silent. As the host returning to the mic, what do you do?', options: ["Agree with the joke and laugh loudly by yourself", "Act like you didn't hear it and start reading the next question", "Lightly roast the speaker or yourself to break the tension, say \"Let's pretend that didn't happen,\" and smoothly transition", "Ask the audience why they aren't laughing"] },
    { q: 'To get maximum organic traction (people tagging each other, posting on stories) from an E-Cell event, what physical setup should the Host/Media team ensure?', options: ["Very serious, strict no-photo rules", "A well-lit, aesthetic photo booth or step-and-repeat with the E-Cell logo and cool props", "A plain white wall", "Distribute printed resumes of the hosts"] },
    { q: '[Situation] During the Q&A session, an audience member takes the mic and starts aggressively arguing with the speaker about politics, derailing the event. How do you handle it as the host?', options: ["Let them argue; conflict brings views", "Jump in, say \"We appreciate the passion, but let's keep it focused on startups today,\" and politely take the mic back", "Call security to physically remove them", "Argue back with the audience member"] },
    { q: '[Situation] You are on stage introducing a very famous CEO. Suddenly, you completely forget their name. What is the most professional "influencer" way to recover?', options: ["Run off the stage crying", "Ask the audience \"Who is this guy again?\"", "Look at your cue card/phone, smile confidently, say, \"My brain just did a quick reboot, let me reintroduce you to the legendary mind...\", and read the name", "Stand frozen like a statue until someone whispers it to you"] }
  ];

  const handleAnswerSelection = async (selectedOptionIdx: number) => {
    const updatedIndices = [...selectedIndices, selectedOptionIdx];
    setSelectedIndices(updatedIndices);

    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/recruitment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: activeCandidate.name,
            email: activeCandidate.email,
            dept: activeCandidate.dept,
            round1Choices: updatedIndices,
          }),
        });

        const auditData = await response.json();
        if (auditData.success) {
          setQuizFinished(true); // Triggers the Standby Screen in page.tsx
        } else {
          alert(auditData.error || "Submission rejected by server.");
        }
      } catch (err) {
        alert("Server validation failure. Check network.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // If they finished, show the Standby UI immediately instead of rejection/acceptance
  if (quizFinished && !round1Passed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-950 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto font-mono shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 animate-pulse" />
        <Clock className="text-amber-500 mx-auto animate-pulse" size={36} />
        <div className="space-y-1">
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Application Under Review</h3>
          <p className="text-[11px] text-amber-500/60 leading-relaxed pt-2">
            Your evaluation matrix has been securely locked and submitted to the E-Cell core systems. 
            The system is calculating percentiles across all candidates. 
            <br/><br/>
            Check back here when the Top 70 Shortlist is released.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center font-mono text-[10px] text-white/40 uppercase tracking-widest gap-2">
        <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-blue-500" /> Negative Marking Active (+3/-1)</span>
        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
          Question {currentQuestionIdx + 1} of {quizQuestions.length}
        </span>
      </div>
      <div className="p-6 space-y-6">
        <h3 className="text-sm font-medium font-mono text-white/90 leading-relaxed">
          {quizQuestions[currentQuestionIdx].q}
        </h3>
        <div className="flex flex-col gap-2.5 pt-2">
          {quizQuestions[currentQuestionIdx].options.map((opt, i) => (
            <button
              key={i}
              disabled={isSubmitting}
              onClick={() => handleAnswerSelection(i)}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-white/70 leading-normal hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
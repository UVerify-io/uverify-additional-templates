import { useState } from 'react';

interface AccordionInfoProps {
  question: string;
  answer: string;
  InfoIcon?: React.ComponentType<{ className?: string }>;
}

export default function AccordionInfo({
  question,
  answer,
}: AccordionInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 w-full max-w-md flex justify-center items-center flex-col">
      <button
        type="button"
        className="flex items-center text-left text-xs font-normal hover:underline focus:outline-none cursor-pointer"
        aria-expanded={open}
        aria-controls="accordion-content"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg
          className="w-3 h-3 me-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7.529 7.988a2.502 2.502 0 0 1 5 .191A2.441 2.441 0 0 1 10 10.582V12m-.01 3.008H10M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>

        {question}
        <span className="ml-2 transition-transform duration-100" aria-hidden>
          <svg
            className={`w-3 h-3 transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        id="accordion-content"
        className={`max-w-72 mt-2 p-4 border border-white rounded text-xs text-white
            ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
      >
        {answer}
      </div>
    </div>
  );
}

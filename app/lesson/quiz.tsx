"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { reduceHearts } from "@/actions/user-progress";
import { challengeOptions, challenges } from "@/db/schema";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  userSubscription: any;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challenges] = useState(initialLessonChallenges); 
  //creating a state

  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );

    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    // if uncompleted index is -1 , then make it 0, otherwise load first uncomplete index
  });

  const [selectedOption,setSelectedOption] = useState<number>(); //type is number

  const [status,setStatus] = useState<"correct" | "wrong" |"none">("none");
  // by default it is "none"
  //   const [status,setStatus] = useState<"correct" | "wrong" |"none">("correct");


  const challenge = challenges[activeIndex]; //control which challenge is currently active,either put it at 0 or go to the previous one
  // current challenge

  const options = challenge?.challengeOptions ?? [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id:number) => {
    if (status !== "none") return ; // the use didnt submit his choice

    setSelectedOption(id);
  }

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return ;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return ;
    }

    if (correctOption && correctOption.id === selectedOption) { 
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            console.log("Missing hearts");
            return;
          }

          setStatus("correct");
          setPercentage((prev) => prev = 100 / challenges.length);

          if (initialPercentage === 100) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
        })
        .catch(() => toast.error("Something went wrong"))
      });
    }
    else {
      startTransition(() => {
        reduceHearts(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            console.error("Missing hearts");
            return;
          }

          setStatus("wrong");

          if (!response?.error) setHearts((prev) => Math.max(prev - 1, 0));

        })
        .catch(() => toast.error("Something went wrong. Please try again."));
      });
        }
  };

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;
      //if ASSIST , render the ".." else if SELECT then...

  return (
    <>
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}      
        />

<div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {/* Which of these is an apple? */}
              {title}
            </h1>

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                // status="correct"
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer 
          disabled={pending || !selectedOption} // disabled if we dont have a selected option
          status={status}
          onCheck={onContinue}
        />
    </>
  );
};
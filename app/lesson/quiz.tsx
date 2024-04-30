"use client";

import { useState } from "react";
import { challengeOptions, challenges } from "@/db/schema";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";

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

  const onSelect = (id:number) => {
    if (status !== "none") return ; // the use didnt submit his choice

    setSelectedOption(id);
  }

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
                disabled={false}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer 
          disabled={!selectedOption} // disabled if we dont have a selected option
          status={status}
          onCheck={() => {}}
        />
    </>
  );
};

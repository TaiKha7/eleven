
"use client" ;

import { courses, userProgress } from "@/db/schema";
import {  toast} from "sonner";
import { Card } from "./card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
// courses: typeof gonna get the type from DB schema 
 

type Props = {
    courses:typeof courses.$inferSelect[]; 
    // ? : it's an optional attribute and typeof : to get automatically the type of the next attribute 
    activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
}; 

export const List = ({courses,activeCourseId} :Props) =>{
    const router = useRouter();  
    const [pending,startTransition]= useTransition();

    const onClick = (id: number) => {
        if (pending) return;
    
        if (id === activeCourseId) {
          return router.push("/learn");
        }
    
        startTransition(() => {
          upsertUserProgress(id)  
            .catch(() => toast.error("Something went wrong."));
        });
      };
    // startTransition : if user select a new course 
     
    return( 
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {courses.map((course)=> (
                <Card  
                key={course.id} 
                id={course.id}
                title={course.title}
                imageSrc={course.imageSrc}
                onClick={onClick}
                disabled={false}
                active ={course.id === activeCourseId}
                
                />

            )
            
            )}
        </div>
    );
}; 


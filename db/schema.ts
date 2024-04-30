
import { relations } from "drizzle-orm";
import { boolean,pgEnum,integer, pgTable, serial, text } from "drizzle-orm/pg-core";
//serial : for auto-increment 
export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("image_src").notNull(),

});
// relation of many to many bwn  course and userProgress 
export const coursesRelations = relations( courses , ({many})=>({
    userProgress:many(userProgress),
}));

export const units = pgTable("units", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(), // Unit 1
    description: text("description").notNull(), // Learn the basics of spanish
    courseId: integer("course_id")
      .references(() => courses.id, {
        onDelete: "cascade",
      })
      .notNull(),
    order: integer("order").notNull(),
  });


  export const unitsRelations = relations(units, ({ many, one }) => ({
    course: one(courses, {
      fields: [units.courseId],
      references: [courses.id],
    }),
    lessons: many(lessons),
  }));

  export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    unitId: integer("unit_id")
      .references(() => units.id, {
        onDelete: "cascade",
      })
      .notNull(),
    order: integer("order").notNull(),
  });
  
  export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
      fields: [lessons.unitId],
      references: [units.id],
    }),
    challenges: many(challenges),
  }));

  export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);
  
  export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id")
      .references(() => lessons.id, {
        onDelete: "cascade",
      })
      .notNull(),
    type: challengesEnum("type").notNull(),
    question: text("question").notNull(),
    order: integer("order").notNull(),
  });
  
  export const challengesRelations = relations(challenges, ({ one, many }) => ({
    lesson: one(lessons, {
      fields: [challenges.lessonId],
      references: [lessons.id],
    }),
    challengeOptions: many(challengeOptions),
    challengeProgress: many(challengeProgress),
  }));
  
  export const challengeOptions = pgTable("challenge_options", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id")
      .references(() => challenges.id, {
        onDelete: "cascade",
      })
      .notNull(),
    text: text("text").notNull(),
    correct: boolean("correct").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
  });
   
  export const challengeOptionsRelations = relations(
    challengeOptions,
    ({ one }) => ({
      challenge: one(challenges, {
        fields: [challengeOptions.challengeId],
        references: [challenges.id],
      }),
    })
  );
  
  export const challengeProgress = pgTable("challenge_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    challengeId: integer("challenge_id")
      .references(() => challenges.id, {
        onDelete: "cascade",
      })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
  });
  
  export const challengeProgressRelations = relations(
    challengeProgress,
    ({ one }) => ({
      challenge: one(challenges, {
        fields: [challengeProgress.challengeId],
        references: [challenges.id],
      }),
    })
  );
  
  


export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey(),
    userName: text("user_name").notNull(),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    activeCourseId: integer('active_course_id').references(() => courses.id,{onDelete:'cascade'}),
     //when a course is deleted, remove the reference to it in,
    hearts:integer("hearts").notNull().default(5),
    points:integer("points").notNull().default(0),
    
});
 
// relation of one to many bwn  activecourse and userProgress 

export const userProgressRelations = relations( userProgress , ({one})=>({
    activeCourse:one(courses,{
        fields:[userProgress.activeCourseId],// the field used in the relationship
        references:[courses.id]//  specifies the fields being referenced in the courses table.
    }),
}));

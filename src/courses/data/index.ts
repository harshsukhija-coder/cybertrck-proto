import type { Course, CourseChapter } from "../types";
import { databases } from "./databases";
import { finance } from "./finance";
import { marketing } from "./marketing";
import { networking } from "./networking";

export const COURSES: Course[] = [networking, databases, finance, marketing];

export const findCourse = (id: string) => COURSES.find(c => c.id === id);

export const chapterHash = (course: Course, chapter: CourseChapter) => `#/learn/${course.id}/${chapter.id}`;

/** Every chapter with its course, for feeds and collages */
export const ALL_CHAPTERS = COURSES.flatMap(course => course.chapters.map(chapter => ({ course, chapter })));

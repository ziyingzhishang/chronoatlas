import type { Person } from '../domain/types';

export const people: Person[] = [];

export const personById = Object.fromEntries(people.map((person) => [person.id, person]));

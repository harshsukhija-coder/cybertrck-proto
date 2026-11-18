import { cast, type CastWho } from "./project-faces";

export const Face = ({ who, size = "md" }: { who: CastWho; size?: "sm" | "md" | "lg" }) => {
  const person = cast[who];
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <img
      src={person.face}
      alt={person.label}
      className={`${dim} shrink-0 rounded-full border-2 object-cover`}
      style={{ borderColor: person.color }}
    />
  );
};

import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { PersonSummary } from "@/types/tmdb";

export default function PersonCard({ person }: { person: PersonSummary }) {
  const photoUrl = tmdbImageUrl(person.profile_path, "w200");

  return (
    <Link
      href={`/person/${person.id}`}
      className="flex w-28 shrink-0 flex-col items-center gap-2 text-center"
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={person.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No Image
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-sm font-medium">{person.name}</span>
    </Link>
  );
}

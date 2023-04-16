import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";

export default function NavbarProfile() {
  const { data } = useSession();
  const me = api.auth.me.useQuery(undefined, {
    enabled: !!data,
  });

  if (!data)
    return (
      <Link href="/auth/signup" className="rounded-sm bg-slate-600 p-2">
        Sign Up / Log In
      </Link>
    );

  return (
    <div className="flex flex-row gap-2">
      <img src={me.data?.profilePicture} className="m-auto h-12 w-12" />
      <div className="flex flex-col whitespace-nowrap">
        <span>{data.user.name}</span>
        <span
          className="cursor-pointer text-gray-400"
          onClick={() => {
            signOut();
          }}
        >
          Log out
        </span>
      </div>
    </div>
  );
}

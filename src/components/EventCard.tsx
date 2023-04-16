import { useSession } from "next-auth/react";
import { MdLocationOn } from "react-icons/md";
import { Button } from "./Button";
import { api } from "~/utils/api";
import { useState } from "react";

type EventCardProps = {
  event: {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    tags: string[];

    type: "VIRTUAL" | "IN_PERSON";
    locationName: string | null;

    date: Date;
    createdAt: Date;
    updatedAt: Date;

    coordinator: {
      name: string | null;
      profilePicture: string;
    };

    numAttendees: number;
    attendees?: any[];
  };

  hideRegisterButton?: boolean;
};

const eventType = {
  VIRTUAL: "Virtual",
  IN_PERSON: "In Person",
};

function ImageRenderer(props: { images: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {/* first image is big */}
      <img
        src={props.images[0]}
        className="max-h-80 w-full rounded-md object-cover"
      />

      {/* other images are small on the bottom */}
      <div className="mx-auto flex flex-row gap-2">
        {props.images.slice(1).map((image) => {
          return (
            <img src={image} className="h-12 w-16 rounded-md object-cover" />
          );
        })}
      </div>
    </div>
  );
}

export default function EventCard(props: EventCardProps) {
  const session = useSession();

  const [registered, setRegistered] = useState(
    props.event.attendees?.some(
      (attendee) => attendee.email === session.data?.user.email
    )
  );

  const register = api.meets.register.useMutation({
    onSuccess: () => {
      setRegistered(true);
    },
  });

  return (
    <div className="flex flex-col gap-1 rounded-md bg-slate-800 p-4 shadow-lg">
      {/* Event Name */}
      <div className="flex flex-row justify-between">
        <h1 className="text-xl text-white">
          {props.event.name}{" "}
          <span className="text-slate-400">
            • {eventType[props.event.type]}
          </span>
        </h1>

        {/* Register button */}
        {!props.hideRegisterButton && session.status === "authenticated" && (
          <Button
            className="py-1 text-white"
            variant={registered ? "secondary" : "primary"}
            onClick={() => {
              register.mutate({
                eventId: props.event.id,
              });
            }}
            loading={register.isLoading}
            disabled={register.isLoading || registered}
          >
            {registered ? "Registered" : "Register"}
          </Button>
        )}
      </div>

      {/* Event Description */}
      <p className="text-slate-400">{props.event.description}</p>

      {/* Event Images */}
      {props.event.images.length > 0 && (
        <ImageRenderer images={props.event.images} />
      )}

      {/* Event Tags */}
      <div className="flex flex-row gap-2">
        {props.event.tags.map((tag, i) => {
          return (
            <span
              className="rounded-lg bg-slate-700 px-1 text-slate-300"
              key={i}
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Event location */}
      {props.event.locationName && (
        <div className="flex flex-row gap-1 align-middle">
          <MdLocationOn className="my-auto" />
          {props.event.locationName}
        </div>
      )}

      {/* Event host and date*/}
      <div className="flex w-full flex-row">
        {/* left is host */}
        <div className="flex w-1/2 flex-row gap-2 align-middle">
          <img
            src={props.event.coordinator.profilePicture}
            className="h-8 w-8 rounded-full"
          />
          <div className="my-auto flex flex-row gap-2">
            <span className="text-white">@{props.event.coordinator.name}</span>
            <span className="text-slate-500">
              • {props.event.numAttendees} attendees
            </span>
          </div>
        </div>

        {/* right is date */}
        <div className="flex w-1/2 flex-row justify-end">
          <span className="my-auto text-slate-500">
            {props.event.date.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

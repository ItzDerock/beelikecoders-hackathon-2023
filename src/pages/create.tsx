import { useForm } from "@mantine/form";
import { GetServerSidePropsContext, type NextPage } from "next";
import { useEffect, useState } from "react";
import Navbar from "~/partials/Navbar";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import InPersonIcon from "../undraw/undraw_in_love_62yu.svg";
import VirtualIcon from "../undraw/undraw_mindfulness_uhb4.svg";
import Image from "next/image";
import { Button } from "~/components/Button";
import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";
import { Input } from "~/components/Input";
import EventCard from "~/components/EventCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

enum CreateMeetSteps {
  CHOOSE_TYPE,
  CHOOSE_DATE,
  FILL_DETAILS,
  CONFIRM,
  MEET_CREATED,
}

const CreateMeet: NextPage = () => {
  const session = useSession();
  const me = api.auth.me.useQuery();
  const [step, setStep] = useState(CreateMeetSteps.CHOOSE_TYPE);
  const router = useRouter();

  const create = api.meets.create.useMutation({
    onSuccess: () => {
      setStep(CreateMeetSteps.MEET_CREATED);
    },
  });

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      type: "" as "VIRTUAL" | "IN_PERSON",
      tags: "",
      images: "",
      date: new Date(),
      locationName: "",
    },

    validate: {
      name: (value) => {
        if (value.length === 0) {
          return "Name is required";
        }
      },

      description: (value) => {
        if (value.length === 0) {
          return "Description is required";
        }
      },

      locationName: (value) => {
        if (value.length === 0) {
          return "Location name is required (zoom link, address, etc.)";
        }
      },
    },
  });

  const nextStep = () => {
    if (create.isLoading) return;

    if (step === CreateMeetSteps.CONFIRM) {
      create.mutate({
        type: form.values.type,
        name: form.values.name,
        description: form.values.description,
        tags: form.values.tags.split(",").filter((tag) => tag.length > 0),
        images: form.values.images
          .split(",")
          .filter((image) => image.length > 0),
        date: form.values.date.toUTCString(),
        location: form.values.locationName,
      });
    }

    setStep((step) => {
      if (step === CreateMeetSteps.CONFIRM) {
        return step;
      }

      return ++step;
    });
  };

  const prevStep = () => {
    setStep((step) => {
      if (step === 0) {
        return step;
      }

      return --step;
    });
  };

  return (
    <main className="h-full w-full">
      <Navbar />

      <div className="mx-auto max-w-3xl pt-8">
        {step === CreateMeetSteps.CHOOSE_TYPE && (
          <div className="flex flex-col align-middle">
            <h1 className="mb-4 text-center text-3xl font-bold">
              Choose a type
            </h1>

            <div className="flex flex-row gap-2 text-center">
              <div
                onClick={() => form.setFieldValue("type", "VIRTUAL")}
                className={`w-1/2 cursor-pointer space-y-2 rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  form.values.type === "VIRTUAL"
                    ? "bg-blue-700"
                    : "bg-slate-700"
                }`}
              >
                <h1 className="text-2xl font-bold">Virtual</h1>
                <p className="text-slate-400">
                  Create an online meditation session, yoga class, or anything!
                </p>
                <Image
                  src={VirtualIcon}
                  className="h-40 w-full object-contain"
                  alt="virtual"
                />
              </div>

              <div
                onClick={() => form.setFieldValue("type", "IN_PERSON")}
                className={`w-1/2 cursor-pointer space-y-2 rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  form.values.type === "IN_PERSON"
                    ? "bg-blue-700"
                    : "bg-slate-700"
                }`}
              >
                <h1 className="text-2xl font-bold">In Person</h1>
                <p className="text-slate-400">
                  Create an in-person meet for hiking, cycling, or anything!
                </p>
                <Image
                  src={InPersonIcon}
                  className="h-40 w-full object-contain"
                  alt="virtual"
                />
              </div>
            </div>

            <Button
              onClick={nextStep}
              loading={!form.values.type}
              className="mx-auto mt-4 px-4 py-2"
            >
              Next
            </Button>
          </div>
        )}

        {step === CreateMeetSteps.CHOOSE_DATE && (
          <div className="flex flex-col align-middle">
            <h1 className="mb-4 text-center text-3xl font-bold">
              Choose a date
            </h1>

            <Calendar
              minDate={new Date()}
              calendarType="US"
              onChange={(data) => {
                const currentDate = form.values.date;
                const newDate = new Date(data?.toString()!);

                // transfer hours and minutes
                newDate.setHours(currentDate.getHours());
                newDate.setMinutes(currentDate.getMinutes());

                form.setFieldValue("date", newDate);
              }}
            />

            {/* select time */}
            <input
              type="time"
              className="mx-auto mt-4 w-fit rounded-md border border-slate-700 bg-slate-700 p-2 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-700"
              onChange={(e) => {
                const currentDate = form.values.date;

                // set hours
                currentDate.setHours(parseInt(e.target.value.split(":")[0]!));

                // set minutes
                currentDate.setMinutes(parseInt(e.target.value.split(":")[1]!));

                // update
                form.setFieldValue("date", currentDate);
              }}
            />

            {/* show selected */}
            <h1 className="mx-auto pt-4">
              {form.values.date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }) +
                " " +
                form.values.date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
            </h1>

            <Button
              onClick={nextStep}
              loading={!form.values.date}
              className="mx-auto mt-4 px-4 py-2"
            >
              Next
            </Button>
          </div>
        )}

        {step === CreateMeetSteps.FILL_DETAILS && (
          <div className="flex flex-col align-middle">
            <h1 className="mb-4 text-center text-3xl font-bold">
              Fill in details
            </h1>

            <div className="flex flex-col gap-2">
              <Input
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
                error={form.errors.name}
              />

              <Input
                label="Description"
                placeholder="Description"
                {...form.getInputProps("description")}
                error={form.errors.description}
              />

              <Input
                label="Tags"
                placeholder="Tags (separate by comma)"
                {...form.getInputProps("tags")}
                error={form.errors.tags}
              />

              <Input
                label="Images"
                placeholder="Images (separate by comma)"
                {...form.getInputProps("images")}
                error={form.errors.images}
              />

              <Input
                label="Location Name"
                placeholder="Location Name"
                {...form.getInputProps("locationName")}
                error={form.errors.locationName}
              />

              <Button
                onClick={() => {
                  if (!form.validate().hasErrors) {
                    console.log("good press");
                    nextStep();
                  }
                }}
                className="mx-auto mt-4 px-4 py-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === CreateMeetSteps.CONFIRM && (
          <div className="flex flex-col align-middle">
            <h1 className="mb-4 text-center text-3xl font-bold">
              Confirm details
            </h1>

            <EventCard
              event={{
                id: "1",
                name: form.values.name,
                description: form.values.description,
                tags: form.values.tags?.split(","),
                images: form.values.images?.split(","),
                locationName: form.values.locationName,
                date: form.values.date,
                type: form.values.type,
                coordinator: {
                  name: session.data?.user.name ?? "You",
                  profilePicture: me.data?.profilePicture ?? "",
                },

                numAttendees: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              hideRegisterButton={true}
            />

            <Button
              onClick={nextStep}
              loading={create.isLoading}
              className="mx-auto mt-4 px-4 py-2"
            >
              Create
            </Button>
          </div>
        )}

        {step === CreateMeetSteps.MEET_CREATED && (
          <div className="flex flex-col align-middle">
            <h1 className="mb-4 text-center text-3xl font-bold">
              Meet created!
            </h1>

            <Button
              onClick={() => router.push("/")}
              className="mx-auto mt-4 px-4 py-2"
            >
              Go to home
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default CreateMeet;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },

      props: {},
    };
  }

  return {
    props: {},
  };
};

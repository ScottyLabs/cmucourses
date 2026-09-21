import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type PublishedSchedule,
  type SocialDirectoryProfile,
  type SocialReaction,
} from "@cmucourses/profile";
import { showToast } from "~/components/Toast";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const backendUrl = () =>
  process.env.NEXT_PUBLIC_PROFILE_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

const DIRECTORY_KEY = "socialDirectory";

export const useSocialDirectory = () => {
  const { isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: [DIRECTORY_KEY],
    queryFn: async (): Promise<SocialDirectoryProfile[]> => {
      const token = await getToken();
      if (!token) return [];
      const response = await axios.post<SocialDirectoryProfile[]>(
        `${backendUrl()}/social/directory`,
        { token }
      );
      return response.data;
    },
    enabled: !!isSignedIn,
  });
};

const useSocialMutation = <T extends object>(path: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: T) => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      await axios.patch(`${backendUrl()}${path}`, { token, ...input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
    },
    onError: () =>
      showToast({
        message: "Couldn't update Scotty Circles. Please try again.",
        icon: ExclamationTriangleIcon,
      }),
  });
};

export const usePublishSocialSchedule = () =>
  useSocialMutation<{ schedule: PublishedSchedule | null }>(
    "/user/social/schedule"
  );

export const useToggleFollow = () =>
  useSocialMutation<{ profileID: string; follow: boolean }>(
    "/user/social/follow"
  );

export const useReactToSchedule = () =>
  useSocialMutation<{
    profileID: string;
    reaction: SocialReaction | null;
  }>("/user/social/reaction");

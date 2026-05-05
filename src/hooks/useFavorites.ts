import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*, houses(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useFavoriteIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ids", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("house_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((f) => f.house_id);
    },
    enabled: !!user,
  });
};

export const useToggleFavorite = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ houseId, isFav }: { houseId: string; isFav: boolean }) => {
      if (!user) throw new Error("You must be signed in to manage favorites.");
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user!.id)
          .eq("house_id", houseId);
        if (error) throw error;
        return { houseId, removed: true };
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user!.id, house_id: houseId });
        if (error) throw error;
        return { houseId, removed: false };
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite-ids"] });
      if (res?.removed) toast.success("Removed from favorites");
      else toast.success("Saved to favorites");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Could not update favorites. Please try again.");
    },
  });
};

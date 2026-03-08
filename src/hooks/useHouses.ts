import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type House = Tables<"houses">;
export type HouseInsert = TablesInsert<"houses">;
export type HouseUpdate = TablesUpdate<"houses">;

export const useHouses = (filters?: {
  search?: string;
  minRent?: number;
  maxRent?: number;
  rooms?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["houses", filters],
    queryFn: async () => {
      let query = supabase.from("houses").select("*").order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.minRent) {
        query = query.gte("rent", filters.minRent);
      }
      if (filters?.maxRent) {
        query = query.lte("rent", filters.maxRent);
      }
      if (filters?.rooms && filters.rooms > 0) {
        query = query.eq("rooms", filters.rooms);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useHouse = (id: string) => {
  return useQuery({
    queryKey: ["house", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useMyHouses = (ownerId?: string) => {
  return useQuery({
    queryKey: ["my-houses", ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .eq("owner_id", ownerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ownerId,
  });
};

export const useCreateHouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (house: HouseInsert) => {
      const { data, error } = await supabase.from("houses").insert(house).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["houses"] });
      qc.invalidateQueries({ queryKey: ["my-houses"] });
    },
  });
};

export const useUpdateHouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: HouseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("houses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["houses"] });
      qc.invalidateQueries({ queryKey: ["my-houses"] });
    },
  });
};

export const useDeleteHouse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("houses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["houses"] });
      qc.invalidateQueries({ queryKey: ["my-houses"] });
    },
  });
};

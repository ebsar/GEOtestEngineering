import { createCmsOverrides } from "./site-runtime.js";
import { getSupabaseClient } from "./supabase.js";

export const loadLiveCmsOverrides = async () => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("website_cards")
    .select("*")
    .in("section_key", [
      "inline_text",
      "inline_images",
      "projects.list",
      "projects.filters",
      "list_items.custom",
      "list_items.hidden",
    ])
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return createCmsOverrides(data || []);
};

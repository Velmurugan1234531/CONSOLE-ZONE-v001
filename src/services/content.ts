import { createClient } from "@/utils/supabase/client";
import { Content, ContentSchema } from "@/lib/schemas";

export const getContent = async (type?: 'page' | 'post') => {
    const supabase = createClient();
    let query = supabase.from('content').select('*');
    if (type) query = query.eq('type', type);

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const getContentBySlug = async (slug: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) throw error;
    return data;
};

export const saveContent = async (content: Partial<Content>) => {
    const supabase = createClient();
    const validated = ContentSchema.parse(content);

    if (validated.id) {
        const { data, error } = await supabase
            .from('content')
            .update({ ...validated, updated_at: new Date().toISOString() })
            .eq('id', validated.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('content')
            .insert([{ ...validated, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

export const deleteContent = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('content').delete().eq('id', id);
    if (error) throw error;
};

import { createClient } from "@/utils/supabase/client";

export const uploadFile = async (file: File, bucket: string = 'media') => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
};

export const listFiles = async (bucket: string = 'media') => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(bucket).list();
    if (error) throw error;
    return data;
};

export const deleteFile = async (path: string, bucket: string = 'media') => {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
};

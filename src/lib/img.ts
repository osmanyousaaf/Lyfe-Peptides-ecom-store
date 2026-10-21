// Admin uploads are served by a route handler, so next/image shouldn't try to optimize them.
export const isUpload = (src: string) => src.startsWith("/uploads/");

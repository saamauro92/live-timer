export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { code } = body;

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Authorization code is required",
      });
    }

    // Forward the request to the backend
    const response = await $fetch(`${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001"}/auth/google/callback`, {
      method: "POST",
      body: { code },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Google OAuth callback failed",
    });
  }
});


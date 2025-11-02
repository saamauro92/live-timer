export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token } = body;

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Google token is required",
      });
    }

    // Forward the request to the backend
    const response = await $fetch(`${process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001"}/auth/google`, {
      method: "POST",
      body: { token },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Google authentication failed",
    });
  }
});

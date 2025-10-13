export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/resend-verification`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || "Failed to resend verification email",
    });
  }
});

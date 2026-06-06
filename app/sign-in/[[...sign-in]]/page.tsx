import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        forceRedirectUrl={redirect_url ?? "/dashboard"}
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            card: "shadow-lg rounded-2xl",
          },
        }}
      />
    </div>
  );
}

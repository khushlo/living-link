import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp
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

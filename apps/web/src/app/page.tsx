export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          CocoBu 叩叩簿
        </h1>
        <p className="text-center text-gray-600">
          Expense tracking and split book
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}

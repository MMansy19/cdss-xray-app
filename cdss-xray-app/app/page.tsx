import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        CDSS X-Ray Application
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-md text-center">
        This is a test of Tailwind CSS integration. The styling of this text is handled by Tailwind classes.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg mb-2">Feature 1</h2>
          <p className="text-sm">Description of feature 1</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg mb-2">Feature 2</h2>
          <p className="text-sm">Description of feature 2</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg mb-2">Feature 3</h2>
          <p className="text-sm">Description of feature 3</p>
        </div>
      </div>
    </main>
  );
}

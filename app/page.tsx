import { Button } from "@/components/ui/Button"; // Import the Button component

export default function Home() {
  return (
    // Removed the outer flex container, as the layout already handles min-height and flex column
    <main className="container mx-auto flex flex-grow flex-col items-center justify-center p-8 text-center">

      <h2 className="text-4xl font-bold mb-4 mt-8">
        Connecting Families, One Gift at a Time
      </h2>
      <p className="text-lg text-foreground/80 max-w-2xl mb-8">
        Singlespine makes it easy for the diaspora to send thoughtful gifts back home to Ghana, especially during festive seasons and special occasions.
      </p>

      {/* Use the Button component */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" href="/gifts"> {/* Use Button with appropriate props */}
          Browse Gifts
        </Button>
        <Button size="lg" variant="secondary" href="/how-it-works"> {/* Use Button with appropriate props */}
          Learn More
        </Button>
      </div>

      {/* Placeholder for future map feature hint */}
      <p className="mt-12 text-sm text-foreground/60 font-mono">
        Coming Soon: Map integration using GhanaPost GPS! <code className="bg-secondary px-1 rounded text-primary/80">GH-GPS</code>
      </p>
    </main>
    // Removed the outer div, Footer is handled by layout.tsx
  );
}

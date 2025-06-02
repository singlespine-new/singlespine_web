'use client'
import React, { useState } from "react";
import { SearchBar } from "../ui/SearchBar";

export default function SearchExamples() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setResults([
        `Result 1 for "${query}"`,
        `Result 2 for "${query}"`,
        `Result 3 for "${query}"`
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-12 max-w-3xl mx-auto p-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Default Search</h2>
        <div className="max-w-md">
          <SearchBar
            placeholder="Search for gifts..."
            onSearch={handleSearch}
            loading={isLoading}
          />
          {results.length > 0 && (
            <div className="mt-2 p-3 border rounded-md bg-background">
              <ul className="space-y-1">
                {results.map((result, i) => (
                  <li key={i} className="text-sm">{result}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Search Variants</h2>

        <div>
          <h3 className="text-lg font-medium mb-2">Default</h3>
          <SearchBar placeholder="Default search..." variant="default" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Outline</h3>
          <SearchBar placeholder="Outline search..." variant="outline" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Ghost</h3>
          <SearchBar placeholder="Ghost search..." variant="ghost" />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Search Sizes</h2>

        <div>
          <h3 className="text-lg font-medium mb-2">Small</h3>
          <SearchBar placeholder="Small search..." size="sm" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Medium (default)</h3>
          <SearchBar placeholder="Medium search..." />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Large</h3>
          <SearchBar placeholder="Large search..." size="lg" />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Icon Position</h2>

        <div>
          <h3 className="text-lg font-medium mb-2">Icon Left (default)</h3>
          <SearchBar placeholder="Icon on left..." iconPosition="left" />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Icon Right</h3>
          <SearchBar placeholder="Icon on right..." iconPosition="right" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Custom Styling</h2>
        <SearchBar
          placeholder="Custom styled search..."
          containerClassName="bg-secondary border-primary/20 hover:border-primary/40"
          className="placeholder:italic"
        />
      </section>
    </div>
  );
}

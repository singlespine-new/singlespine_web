import Categories from "@/components/home/Categories";
import TopBar from "@/components/home/TopBar";

const Home = () => {
  return (
    <div className="bg-white text-foreground min-h-screen">
      {/* Sticky header for improved navigation and professional feel */}
      <div className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TopBar />
      </div>

      <main className="w-full z-10">
        <Categories />
      </main>
    </div >
  )
}

export default Home;

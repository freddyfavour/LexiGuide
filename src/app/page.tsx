
import { LexiGuidePageContent } from "@/components/lexiguide/LexiGuidePageContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LexiGuideLogoIcon } from "@/components/lexiguide/icons";

export default function LexiGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LexiGuideLogoIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              LexiGuide
            </h1>
          </div>
          <p className="text-xs sm:text-sm opacity-90">AI-Powered Contract Review</p>
        </div>
      </header>
      
      {/* Added padding-bottom to accommodate the fixed chat input bar */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-32">
        <LexiGuidePageContent />
      </main>

      {/* Footer is removed as the chat bar is now fixed at the bottom, giving a cleaner chat interface */}
      {/* 
      <footer className="bg-muted/50 text-muted-foreground text-center py-3 sm:py-4 border-t">
        <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} LexiGuide. All rights reserved.</p>
      </footer>
      */}
    </div>
  );
}

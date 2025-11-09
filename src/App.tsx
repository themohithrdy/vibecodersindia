import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import AINews from "./pages/Learn";
import Build from "./pages/Build";
import Share from "./pages/Share";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import AddAINewsForm from "./components/AddAINewsForm";
import AddBuildForm from "./components/AddBuildForm";
import AddShareForm from "./components/AddShareForm";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ai-news" element={<AINews />} />
              <Route path="/ai-news/new" element={<AddAINewsForm />} />
              <Route path="/build" element={<Build />} />
              <Route path="/build/new" element={<AddBuildForm />} />
              <Route path="/share" element={<Share />} />
              <Route path="/share/new" element={<AddShareForm />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

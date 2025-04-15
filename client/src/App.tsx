import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Helmet } from "react-helmet";

// Pages
import Home from "@/pages/Home";
import Salons from "@/pages/Salons";
import Services from "@/pages/Services";
import About from "@/pages/About";
import SalonDetails from "@/pages/SalonDetails";
import BookingPage from "@/pages/BookingPage";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

// Layout components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/salons" component={Salons} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/salon/:id" component={SalonDetails} />
      <Route path="/booking/:salonId/:serviceId" component={BookingPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { language, dir } = useLanguage();

  useEffect(() => {
    // Update HTML lang and dir attributes when language changes
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Helmet
        htmlAttributes={{ lang: language, dir: dir }}
        titleTemplate="%s | Jamaalaki"
        defaultTitle="Jamaalaki - Salon Booking"
      >
        <meta name="description" content="Book salon services in Saudi Arabia" />
      </Helmet>
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;

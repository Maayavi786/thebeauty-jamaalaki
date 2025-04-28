import { Switch, Route } from "wouter";
// Toaster temporarily removed for build fix
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

// Owner Pages
import Dashboard from "@/pages/owner/Dashboard";
import SalonProfile from "@/pages/owner/SalonProfile";
import ServicesManagement from "@/pages/owner/ServicesManagement";
import BookingsManagement from "@/pages/owner/BookingsManagement";
import PromotionsManagement from "@/pages/owner/PromotionsManagement";
import Analytics from "@/pages/owner/Analytics";
import Settings from "@/pages/owner/Settings";

// Layout components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import DashboardLink from "@/components/DashboardLink";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/salons" component={Salons} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/salons/:id" component={SalonDetails} />
      <Route path="/booking/:salonId/:serviceId" component={BookingPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Owner Routes with role checking for development mode */}
      <Route path="/owner/dashboard">
        {() => {
          console.log('Rendering owner dashboard route');
          return <Dashboard />;
        }}
      </Route>
      <Route path="/owner/salon-profile">
        {() => {
          console.log('Rendering salon profile route');
          return <SalonProfile />;
        }}
      </Route>
      <Route path="/owner/services" component={ServicesManagement} />
      <Route path="/owner/bookings" component={BookingsManagement} />
      <Route path="/owner/promotions" component={PromotionsManagement} />
      <Route path="/owner/analytics" component={Analytics} />
      <Route path="/owner/settings" component={Settings} />
      
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
    <div
      className="flex flex-col min-h-screen bg-[#FAF6F2] dark:bg-[#18181A]"
      style={{
        backgroundImage: `
          linear-gradient(180deg, #FAF6F2 0%, #FFF8F3 100%),
          url('/assets/luxury-motif-floral.svg'),
          linear-gradient(180deg, #201A23 0%, #18181A 100%)
        `,
        backgroundBlendMode: 'normal',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
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
      {/* Toaster temporarily removed for build fix */}
      {/* Chat widget always visible */}
      <ChatWidget />
      {/* Quick access to salon owner dashboard */}
      <DashboardLink />
    </div>
  );
}

export default App;

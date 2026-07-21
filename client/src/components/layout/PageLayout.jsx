import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Shared page shell used by every authenticated page (Dashboard, Analytics,
// Goals, Profile, Settings) to avoid re-declaring the same Navbar/Sidebar
// wrapper markup in each page.
function PageLayout({ children }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen transition-colors">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

export default PageLayout;

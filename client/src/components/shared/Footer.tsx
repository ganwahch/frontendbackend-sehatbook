import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">
                Sehat<span className="text-primary">Book</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Pakistan's trusted platform to find doctors and book clinic
              appointments online — fast, simple and secure.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">Home</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-primary">Find Doctors</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary">Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Cities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Karachi</li>
              <li>Lahore</li>
              <li>Islamabad</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SehatBook. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

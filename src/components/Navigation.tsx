import { Link } from "react-router-dom"
import { Menu, CalendarDays, Clock, History, ChartColumn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navigation() {
  const routes = [
    { 
      href: "/", 
      label: "Daily",
      icon: CalendarDays 
    },
    { 
      href: "/weekly", 
      label: "Weekly",
      icon: Clock
    },
    { 
      href: "/history", 
      label: "History",
      icon: History
    },
    { 
      href: "/analytics", 
      label: "Analytics",
      icon: ChartColumn
    },
    { 
      href: "/profile", 
      label: "Profile",
      icon: User
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="flex items-center gap-x-2 text-sm font-medium transition-all duration-200 ease-in-out text-muted-foreground hover:text-primary"
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <CalendarDays className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Nine Week Challenge</h1>
            </Link>
          </div>

          <nav className="hidden lg:flex lg:items-center lg:space-x-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out text-muted-foreground hover:bg-secondary/50"
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
} 
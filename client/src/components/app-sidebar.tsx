import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Users,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Star, ShieldCheck, Mail, AlertCircle } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Feedback Assistant",
    url: "/feedback",
    icon: GraduationCap,
  },
  {
    title: "Lesson Planner",
    url: "/planner",
    icon: BookOpen,
  },
  {
    title: "Resources Library",
    url: "/library",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getDaysRemaining = (trialEnd: string | null) => {
    if (!trialEnd) return 0;
    const now = new Date();
    const end = new Date(trialEnd);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining(user?.trialEndDate || null);
  const isTrial = user?.subscriptionStatus === "trial";
  const tier = user?.subscriptionTier;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">
              TeacherBuddy
            </span>
            <span className="text-xs text-muted-foreground">
              AI Teaching Assistant
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {user?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/admin"}
                    data-testid="nav-admin-dashboard"
                    className="text-primary hover:text-primary/80"
                  >
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/contact"}
                  data-testid="nav-contact"
                >
                  <Link href="/contact">
                    <Mail className="h-4 w-4" />
                    <span>Contact Us</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/report-abuse"}
                  data-testid="nav-report-abuse"
                >
                  <Link href="/report-abuse">
                    <AlertCircle className="h-4 w-4" />
                    <span>Report & Abuse</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Subscription Status Section */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account Status</SidebarGroupLabel>
          <SidebarGroupContent className="px-3 py-2">
            {user?.isAdmin ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Access</span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Full Feature Access
                </div>
              </div>
            ) : isTrial ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                  <Calendar className="h-4 w-4" />
                  <span>Free Trial</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {daysRemaining} days remaining
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
                  asChild
                >
                  <Link href="/subscription">Upgrade Now</Link>
                </Button>
              </div>
            ) : tier ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  {tier === "tier2" ? <ShieldCheck className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  <span>{tier === "tier1" ? "Tier 1 Plan" : "Tier 2 Pro"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7 justify-start px-0 text-muted-foreground hover:text-primary transition-colors"
                  asChild
                >
                  <Link href="/subscription">Manage Plan</Link>
                </Button>
              </div>
            ) : null}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || "User")}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2 h-9"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}


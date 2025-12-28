import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BookOpen,
  CheckSquare,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lesson, Task, Class } from "@shared/schema";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && (
            <TrendingUp className="h-3 w-3 text-chart-2" />
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  testId,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  testId: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover-elevate active-elevate-2 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base" data-testid={testId}>
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentLessonCard({ lesson }: { lesson: Lesson }) {
  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    ready: "bg-chart-2/10 text-chart-2",
    completed: "bg-primary/10 text-primary",
  };

  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate" data-testid={`lesson-title-${lesson.id}`}>
              {lesson.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {lesson.subject} - Grade {lesson.grade}
            </p>
          </div>
          <Badge variant="secondary" className={statusColors[lesson.status]}>
            {lesson.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.duration} min
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priorityColors: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-chart-3/10 text-chart-3",
    high: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate">
      <div
        className={`w-2 h-2 rounded-full ${
          task.priority === "high" ? "bg-destructive" : 
          task.priority === "medium" ? "bg-chart-3" : "bg-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" data-testid={`task-title-${task.id}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3" />
            Due {task.dueDate}
          </p>
        )}
      </div>
      <Badge variant="secondary" className={priorityColors[task.priority]}>
        {task.priority}
      </Badge>
    </div>
  );
}

export default function Dashboard() {
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const pendingTasks = tasks?.filter((t) => t.status !== "done") || [];
  const recentLessons = lessons?.slice(0, 3) || [];
  const upcomingTasks = pendingTasks.slice(0, 4);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back, Teacher
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your classes today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lessonsLoading ? (
          <Skeleton className="h-[120px]" />
        ) : (
          <StatCard
            title="Lessons Planned"
            value={lessons?.length || 0}
            icon={BookOpen}
            description="Total lesson plans"
            trend="+2 this week"
          />
        )}
        {tasksLoading ? (
          <Skeleton className="h-[120px]" />
        ) : (
          <StatCard
            title="Pending Tasks"
            value={pendingTasks.length}
            icon={CheckSquare}
            description="Tasks to complete"
          />
        )}
        {classesLoading ? (
          <Skeleton className="h-[120px]" />
        ) : (
          <StatCard
            title="Active Classes"
            value={classes?.length || 0}
            icon={Users}
            description="Classes this semester"
          />
        )}
        <StatCard
          title="Messages"
          value={0}
          icon={MessageSquare}
          description="Communication drafts"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="New Lesson Plan"
            description="Create a structured lesson"
            icon={BookOpen}
            href="/lessons/new"
            testId="action-new-lesson"
          />
          <QuickActionCard
            title="Add Task"
            description="Track your to-dos"
            icon={CheckSquare}
            href="/tasks"
            testId="action-new-task"
          />
          <QuickActionCard
            title="Manage Classes"
            description="View class roster"
            icon={Users}
            href="/classes"
            testId="action-manage-classes"
          />
          <QuickActionCard
            title="Write Message"
            description="Draft communications"
            icon={FileText}
            href="/communication"
            testId="action-new-message"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Lessons</h2>
            <Link href="/lessons">
              <Button variant="ghost" size="sm" data-testid="link-view-all-lessons">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {lessonsLoading ? (
              <>
                <Skeleton className="h-[100px]" />
                <Skeleton className="h-[100px]" />
                <Skeleton className="h-[100px]" />
              </>
            ) : recentLessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No lessons planned yet
                  </p>
                  <Link href="/lessons/new">
                    <Button data-testid="button-create-first-lesson">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first lesson
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              recentLessons.map((lesson) => (
                <RecentLessonCard key={lesson.id} lesson={lesson} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" data-testid="link-view-all-tasks">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {tasksLoading ? (
              <>
                <Skeleton className="h-[60px]" />
                <Skeleton className="h-[60px]" />
                <Skeleton className="h-[60px]" />
                <Skeleton className="h-[60px]" />
              </>
            ) : upcomingTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tasks to complete
                  </p>
                  <Link href="/tasks">
                    <Button data-testid="button-create-first-task">
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first task
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

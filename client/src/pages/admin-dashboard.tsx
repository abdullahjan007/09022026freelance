import { useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";
import type { User } from "@shared/schema";

export default function AdminDashboard() {
    const { data: users, isLoading, error } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-destructive">
                Error loading users. You might not have permission.
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your users and monitor application growth.
                    </p>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
                                <p className="text-2xl font-bold">{users?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Last Login</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.firstName} {user.lastName}
                                                {user.isAdmin && (
                                                    <Badge variant="secondary" className="ml-2 text-[10px] h-4">Admin</Badge>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isAdmin ? "default" : (user.subscriptionStatus === "active" ? "default" : "secondary")}
                                            className="capitalize"
                                        >
                                            {user.isAdmin ? "Admin" : (user.subscriptionStatus || "New")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {user.isAdmin ? "Full Access" : (
                                                user.subscriptionTier === "tier2" ? "Pro (Tier 2)" :
                                                    user.subscriptionTier === "tier1" ? "Basic (Tier 1)" : "Trial"
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, HH:mm") : "Never"}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

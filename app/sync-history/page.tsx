"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useSyncHistoriesQuery } from "@/lib/hooks/useSyncHistory";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function SyncHistoryPage() {
    const [page, setPage] = useState(1);

    // Using page-based pagination. Add pagination UI if necessary.
    const { data: syncData, isLoading, isError, refetch } = useSyncHistoriesQuery({
        page,
        limit: 20, // Load top 20 at a time
    });

    return (
        <MainLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sync History</h1>
                        <p className="text-muted-foreground">
                            Logs for all background/manual synchronizations with Ayo.co.id APIs.
                        </p>
                    </div>

                    <Button onClick={() => refetch()} disabled={isLoading} variant="outline" className="gap-2">
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Synchronizations</CardTitle>
                        <CardDescription>
                            Showing the latest system sync executions. Both Success and Failure states are natively logged.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : isError ? (
                            <div className="text-center p-8 text-destructive">
                                Failed to fetch sync history records.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Summary / Details</TableHead>
                                            <TableHead>Triggered By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!syncData?.histories?.length ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                    No synchronization history records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            syncData.histories.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {format(new Date(row.createdAt), "dd MMM yyyy, HH:mm:ss")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={row.type === "BOOKING" ? "default" : "secondary"}>
                                                            {row.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={row.status === "SUCCESS" ? "default" : "destructive"}>
                                                            {row.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[400px] truncate text-sm" title={row.summary}>
                                                            {row.summary}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.triggerer ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{row.triggerer.name}</span>
                                                                <span className="text-xs text-muted-foreground">{row.triggerer.email}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs italic text-muted-foreground">System</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

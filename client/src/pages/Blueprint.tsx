import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function Blueprint() {
  const [, setLocation] = useLocation();

  return (
    <AppLayout title="Blueprint Configuration">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
            <h2 className="text-2xl font-bold font-heading">Step 5: Blueprint Setup</h2>
            <p className="text-muted-foreground">Configure the marks distribution and CO-Unit mapping matrix.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Marks Distribution Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-center">Part A (2 Marks)</TableHead>
                                    <TableHead className="text-center">Part B (13 Marks)</TableHead>
                                    <TableHead className="text-center">Part C (15 Marks)</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3, 4, 5].map((unit) => (
                                    <TableRow key={unit}>
                                        <TableCell className="font-medium">Unit {unit}</TableCell>
                                        <TableCell className="text-center">
                                            <Input className="w-16 h-8 text-center mx-auto" defaultValue="2" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input className="w-16 h-8 text-center mx-auto" defaultValue="1" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input className="w-16 h-8 text-center mx-auto" defaultValue={unit === 5 ? "1" : "0"} />
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-muted-foreground">
                                            {unit === 5 ? "32" : "17"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-50 font-bold">
                                    <TableCell>Total Questions</TableCell>
                                    <TableCell className="text-center">10</TableCell>
                                    <TableCell className="text-center">5</TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-right">100 Marks</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Difficulty Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Easy (L1-L2)</span>
                                <span>30%</span>
                            </div>
                            <Slider defaultValue={[30]} max={100} step={5} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Medium (L3-L4)</span>
                                <span>50%</span>
                            </div>
                            <Slider defaultValue={[50]} max={100} step={5} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Hard (L5-L6)</span>
                                <span>20%</span>
                            </div>
                            <Slider defaultValue={[20]} max={100} step={5} className="w-full" />
                        </div>
                    </CardContent>
                 </Card>
                 
                 <Button className="w-full" size="lg" onClick={() => setLocation("/generate")}>
                    Confirm Blueprint <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}

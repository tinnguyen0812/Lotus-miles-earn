
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { submitClaim } from "@/actions/claims";
import { useRouter } from "next/navigation";

const claimFormSchema = z.object({
  flightNumber: z.string().min(4, "Please enter a valid flight number."),
  flightDate: z.date({ required_error: "Flight date is required." }),
  attachment: z.any().optional(),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

export function ClaimForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
  });

  async function onSubmit(data: ClaimFormValues) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("flightNumber", data.flightNumber);
    formData.append("flightDate", data.flightDate.toISOString());
    // In a real app, you would handle file upload properly here.
    // For this refactor, we are focusing on the form submission action.
    
    const result = await submitClaim(null, formData);

    if (result.errors) {
       Object.values(result.errors).forEach((error) => {
         if (Array.isArray(error)) {
            toast({
              title: "Submission Error",
              description: error.join(', '),
              variant: "destructive",
            });
         }
      });
    } else {
        toast({
            title: "Claim Submitted!",
            description: result.message,
        });
        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        // Redirect or refresh data
        router.refresh();
    }
    
    setIsSubmitting(false);
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <CardHeader>
            <CardTitle>Claim Details</CardTitle>
            <FormDescription>
                You can fill the form manually and optionally upload an attachment.
            </FormDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => ( // The field is not directly used but required by hook-form
                    <FormItem>
                    <FormLabel>E-Ticket / Boarding Pass (Optional)</FormLabel>
                    <FormControl>
                        <Input
                        type="file"
                        ref={fileInputRef}
                        disabled={isSubmitting}
                        accept="image/*,.pdf"
                        className="file:text-primary file:font-semibold"
                        onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                        />
                    </FormControl>
                    <FormDescription>
                        Upload an image or PDF of your flight document for verification.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="flightNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Flight Number</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="e.g., VN248"
                            {...field}
                            disabled={isSubmitting}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="flightDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Flight Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                            >
                                {field.value ? (
                                format(field.value, "PPP")
                                ) : (
                                <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1990-01-01")
                            }
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Submit Claim
                </Button>
            </CardContent>
        </form>
      </Form>
    </Card>
  );
}

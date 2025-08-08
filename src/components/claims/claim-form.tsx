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
import { extractFlightInfo } from "@/ai/flows/extract-flight-info";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const claimFormSchema = z.object({
  flightNumber: z.string().min(4, "Please enter a valid flight number."),
  flightDate: z.date({ required_error: "Flight date is required." }),
  attachment: z.any().optional(),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

export function ClaimForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    toast({
      title: "Analyzing Attachment",
      description: "Our AI is extracting flight details. Please wait...",
    });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const attachmentDataUri = reader.result as string;
        const result = await extractFlightInfo({
          attachmentDataUri,
          attachmentName: file.name,
        });

        if (result.flightNumber) {
          form.setValue("flightNumber", result.flightNumber, {
            shouldValidate: true,
          });
        }
        if (result.flightDate) {
          const date = new Date(result.flightDate + "T00:00:00");
          form.setValue("flightDate", date, { shouldValidate: true });
        }
        toast({
          title: "Information Extracted",
          description: "Flight details have been pre-filled.",
        });
      };
      reader.onerror = () => {
        throw new Error("Error reading file.");
      };
    } catch (error) {
      console.error("Extraction failed", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Could not extract info. Please enter details manually.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  async function onSubmit(data: ClaimFormValues) {
    setIsSubmitting(true);
    console.log("Submitting:", data);
    // In a real app, you would call a server action here:
    // await submitClaim(data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
      title: "Claim Submitted!",
      description: "Your claim is now being processed.",
    });
    form.reset();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim Details</CardTitle>
        <FormDescription>
            You can fill the form manually or upload an attachment to let AI do the work.
        </FormDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="attachment"
              render={() => (
                <FormItem>
                  <FormLabel>E-Ticket / Boarding Pass</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isExtracting || isSubmitting}
                      accept="image/*,.pdf"
                      className="file:text-primary file:font-semibold"
                    />
                  </FormControl>
                  <FormDescription>
                    {isExtracting
                      ? "AI is reading your document..."
                      : "Upload an image or PDF of your flight document."}
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
            <Button type="submit" disabled={isSubmitting || isExtracting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Claim
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

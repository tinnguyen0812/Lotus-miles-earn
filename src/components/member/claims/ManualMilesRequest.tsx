"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

type FormState = {
  requestType: "" | "missing-flight" | "partner-purchase" | "credit-card" | "hotel-stay" | "other";
  flightNumber: string;
  route: string;
  flightDate: string;
  bookingReference: string;
  ticketNumber: string;
  description: string;
  expectedMiles: string;
};

export default function ManualMilesRequest() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormState>({
    requestType: "",
    flightNumber: "",
    route: "",
    flightDate: "",
    bookingReference: "",
    ticketNumber: "",
    description: "",
    expectedMiles: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onChange = (field: keyof FormState, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
    toast({ title: t("member.claim.toast.added_files_title"), description: t("member.claim.toast.added_files_desc", { count: list.length }) });
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    toast({ title: t("member.claim.toast.removed_file_title") });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // TODO: call real API here
    toast({
      title: t("member.claim.toast.submitted_title"),
      description: t("member.claim.toast.submitted_desc"),
    });
    // reset
    setFormData({
      requestType: "",
      flightNumber: "",
      route: "",
      flightDate: "",
      bookingReference: "",
      ticketNumber: "",
      description: "",
      expectedMiles: "",
    });
    setFiles([]);
  };

  const flightFields = formData.requestType === "missing-flight";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-600">{t("member.claim.title")}</h2>
        <p className="text-muted-foreground">{t("member.claim.subtitle")}</p>
      </div>

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">
            {t("member.claim.section.info")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Request type */}
            <div className="space-y-2">
              <Label>{t("member.claim.fields.request_type")} *</Label>
              <Select
                value={formData.requestType}
                onValueChange={(v: FormState["requestType"]) => onChange("requestType", v)}
              >
                <SelectTrigger className="border-teal-200 focus:border-teal-600">
                  <SelectValue placeholder={t("member.claim.placeholders.request_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing-flight">{t("member.claim.types.missing_flight")}</SelectItem>
                  <SelectItem value="partner-purchase">{t("member.claim.types.partner_purchase")}</SelectItem>
                  <SelectItem value="credit-card">{t("member.claim.types.credit_card")}</SelectItem>
                  <SelectItem value="hotel-stay">{t("member.claim.types.hotel_stay")}</SelectItem>
                  <SelectItem value="other">{t("member.claim.types.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flight-only fields */}
            {flightFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">{t("member.claim.fields.flight_no")}</Label>
                  <Input
                    id="flightNumber"
                    placeholder={t("member.claim.placeholders.flight_no")}
                    value={formData.flightNumber}
                    onChange={(e) => onChange("flightNumber", e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">{t("member.claim.fields.route")}</Label>
                  <Input
                    id="route"
                    placeholder="SGN - HAN"
                    value={formData.route}
                    onChange={(e) => onChange("route", e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flightDate">{t("member.claim.fields.flight_date")}</Label>
                  <Input
                    id="flightDate"
                    type="date"
                    value={formData.flightDate}
                    onChange={(e) => onChange("flightDate", e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedMiles">{t("member.claim.fields.expected_miles")}</Label>
                  <Input
                    id="expectedMiles"
                    type="number"
                    placeholder="1250"
                    value={formData.expectedMiles}
                    onChange={(e) => onChange("expectedMiles", e.target.value)}
                    className="border-teal-200 focus:border-teal-600"
                  />
                </div>
              </div>
            )}

            {/* Booking info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingReference">{t("member.claim.fields.booking_ref")}</Label>
                <Input
                  id="bookingReference"
                  placeholder={t("member.claim.placeholders.booking_ref")}
                  value={formData.bookingReference}
                  onChange={(e) => onChange("bookingReference", e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">{t("member.claim.fields.ticket_no")}</Label>
                <Input
                  id="ticketNumber"
                  placeholder={t("member.claim.placeholders.ticket_no")}
                  value={formData.ticketNumber}
                  onChange={(e) => onChange("ticketNumber", e.target.value)}
                  className="border-teal-200 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("member.claim.fields.description")} *</Label>
              <Textarea
                id="description"
                placeholder={t("member.claim.placeholders.description")}
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                className="border-teal-200 focus:border-teal-600 min-h-[100px]"
                required
              />
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <Label>{t("member.claim.fields.attachments")} *</Label>
              <div
                className="border-2 border-dashed border-teal-200 rounded-lg p-6 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t("member.claim.upload.hint")}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("member.claim.upload.types")}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={onFileInput}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("member.claim.upload.choose")}
                </Button>
              </div>

              {!!files.length && (
                <div className="space-y-2">
                  <Label>{t("member.claim.upload.added")}</Label>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-teal-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t("common.remove")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!formData.requestType || !formData.description || files.length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              {t("member.claim.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-600">
            {t("member.claim.notes.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-700 text-sm">
          <p>• {t("member.claim.notes.n1")}</p>
          <p>• {t("member.claim.notes.n2")}</p>
          <p>• {t("member.claim.notes.n3")}</p>
          <p>• {t("member.claim.notes.n4")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

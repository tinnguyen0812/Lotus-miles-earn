"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { callApi } from "@/lib/api-client";

type ReqType = "" | "flight" | "purchase" | "other";

type FormState = {
  requestType: ReqType;
  ticketOrInvoice: string; // flight: ticket number; others: invoice number
  seatCode: string;        // only for flight
  amount: string;          // only for purchase/other
  description: string;
};

type UploadedFile = { name: string; size: number; url: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""); // e.g. https://api.example.com/api/v1
const UPLOAD_URL = API_BASE ? `${API_BASE}/ms-users/upload-file` : "/api/v1/ms-users/upload-file";

export default function ManualMilesRequest() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    requestType: "",
    ticketOrInvoice: "",
    seatCode: "",
    amount: "",
    description: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onChange = (field: keyof FormState, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  // ---- UPLOAD ASAP WHEN CHOSEN ----
  const doUpload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    const token = localStorage.getItem("token") || "";
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";

    setUploading(true);
    try {
      const results = await Promise.all(
        list.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);

          const res = await fetch(UPLOAD_URL, {
            method: "POST",
            body: fd,
            headers: {
              Authorization: `Bearer ${token}`,
              "x-user-id": userId,
            },
          });

          const json: any = await res.json().catch(() => ({}));
          if (!res.ok || json?.success === false) {
            throw new Error(json?.message || "Upload failed");
          }

          const url =
            json?.data?.data.path || json?.data?.url || json?.file_url || json?.url || json?.location;
          if (!url) throw new Error("Upload succeeded but file_url is missing");

          return { name: file.name, size: file.size, url: String(url) } as UploadedFile;
        })
      );

      setUploadedFiles((prev) => [...prev, ...results]);
      toast({
        title: t("member.claim.toast.added_files_title"),
        description: t("member.claim.toast.added_files_desc", { count: results.length }),
      });
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void doUpload(e.target.files);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) void doUpload(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
    toast({ title: t("member.claim.toast.removed_file_title") });
  };

  const isFlight = formData.requestType === "flight";
  const isAmountType = formData.requestType === "purchase" || formData.requestType === "other";

  async function createManual(payload: {
    request_type: "flight" | "purchase" | "other";
    description: string;
    ticket_number?: string; // flight ticket or invoice number for others
    seat_code?: string;     // flight only
    amount?: number;        // purchase/other only
    file_url: string;       // first uploaded file
  }) {
    const token = localStorage.getItem("token") || "";
    const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";
    return callApi<any>({
      method: "POST",
      path: "/ms-loyalty/claim-miles-manual/create",
      body: payload,
      headers: { Authorization: `Bearer ${token}`, "x-user-id": userId },
    });
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // validate chung
    if (!formData.requestType) {
      toast({ title: t("common.error"), description: "Request type is required.", variant: "destructive" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: t("common.error"), description: "Description is required.", variant: "destructive" });
      return;
    }
    if (!uploadedFiles.length) {
      toast({ title: t("common.error"), description: "Please attach at least one document.", variant: "destructive" });
      return;
    }

    // validate theo rule
    if (isFlight) {
      if (!formData.ticketOrInvoice.trim() || !formData.seatCode.trim()) {
        toast({
          title: t("common.error"),
          description: "Ticket number and seat code are required for flight.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.ticketOrInvoice.trim() || !formData.amount.trim()) {
        toast({
          title: t("common.error"),
          description: "Invoice number and amount are required.",
          variant: "destructive",
        });
        return;
      }
      if (Number(formData.amount) <= 0 || !Number.isFinite(Number(formData.amount))) {
        toast({
          title: t("common.error"),
          description: "Amount must be a positive number.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // dùng file đầu tiên (API hiện nhận 1 file_url)
      const fileUrl = uploadedFiles[0].url;

      const payload: any = {
        request_type: formData.requestType as "flight" | "purchase" | "other",
        description: formData.description.trim(),
        ticket_number: formData.ticketOrInvoice.trim(), // flight: ticket_no; others: invoice_no
        file_url: fileUrl,
      };

      if (isFlight) {
        payload.seat_code = formData.seatCode.trim();
      } else {
        payload.amount = Number(formData.amount);
      }

      const res = await createManual(payload);
      if (!res?.success) throw new Error(res?.message || "Create request failed");

      toast({
        title: t("member.claim.toast.submitted_title"),
        description: res?.data?.request_number
          ? `Created with code: ${res.data.request_number}`
          : t("member.claim.toast.submitted_desc"),
      });

      // reset
      setFormData({ requestType: "", ticketOrInvoice: "", seatCode: "", amount: "", description: "" });
      setUploadedFiles([]);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-600">{t("member.claim.title")}</h2>
        <p className="text-muted-foreground">{t("member.claim.subtitle")}</p>
      </div>

      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">{t("member.claim.section.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Request type (*) */}
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-1 after:text-red-500">
                {t("member.claim.fields.request_type")}
              </Label>
              <Select
                value={formData.requestType}
                onValueChange={(v: ReqType) => onChange("requestType", v)}
              >
                <SelectTrigger className="border-teal-200 focus:border-teal-600">
                  <SelectValue placeholder={t("member.claim.placeholders.request_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">{t("member.claim.types.missing_flight") || "Flight"}</SelectItem>
                  <SelectItem value="purchase">{t("member.claim.types.partner_purchase") || "Purchase"}</SelectItem>
                  <SelectItem value="other">{t("member.claim.types.other") || "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields */}
            {formData.requestType && (
              isFlight ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketNumber" className="after:content-['*'] after:ml-1 after:text-red-500">
                      {t("member.claim.fields.ticket_no") || "Ticket number"}
                    </Label>
                    <Input
                      id="ticketNumber"
                      placeholder={t("member.claim.placeholders.ticket_no")}
                      value={formData.ticketOrInvoice}
                      onChange={(e) => onChange("ticketOrInvoice", e.target.value)}
                      className="border-teal-200 focus:border-teal-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seatCode" className="after:content-['*'] after:ml-1 after:text-red-500">
                      {t("member.claim.fields.seat_code") || "Seat code"}
                    </Label>
                    <Input
                      id="seatCode"
                      placeholder="36B / A1 …"
                      value={formData.seatCode}
                      onChange={(e) => onChange("seatCode", e.target.value)}
                      className="border-teal-200 focus:border-teal-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNo" className="after:content-['*'] after:ml-1 after:text-red-500">
                      {t("member.claim.fields.booking_ref") || "Invoice number"}
                    </Label>
                    <Input
                      id="invoiceNo"
                      placeholder={t("member.claim.placeholders.booking_ref") || "VIN-000123"}
                      value={formData.ticketOrInvoice}
                      onChange={(e) => onChange("ticketOrInvoice", e.target.value)}
                      className="border-teal-200 focus:border-teal-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="after:content-['*'] after:ml-1 after:text-red-500">
                      {t("member.claim.fields.amount") || "Amount"}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="100000"
                      value={formData.amount}
                      onChange={(e) => onChange("amount", e.target.value)}
                      className="border-teal-200 focus:border-teal-600"
                    />
                  </div>
                </div>
              )
            )}

            {/* Description (*) */}
            <div className="space-y-2">
              <Label htmlFor="description" className="after:content-['*'] after:ml-1 after:text-red-500">
                {t("member.claim.fields.description")}
              </Label>
              <Textarea
                id="description"
                placeholder={t("member.claim.placeholders.description")}
                value={formData.description}
                onChange={(e) => onChange("description", e.target.value)}
                className="border-teal-200 focus:border-teal-600 min-h-[100px]"
                required
              />
            </div>

            {/* Upload (*) */}
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-1 after:text-red-500">
                {t("member.claim.fields.attachments")}
              </Label>
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
                  accept={[
                    ".pdf",
                    ".doc",
                    ".docx",
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".gif",
                    ".bmp",
                    ".webp",
                  ].join(",")}
                  onChange={onFileInput}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t("member.claim.upload.choose")}
                </Button>
              </div>

              {!!uploadedFiles.length && (
                <div className="space-y-2">
                  <Label>{t("member.claim.upload.added")}</Label>
                  {uploadedFiles.map((f, i) => (
                    <div key={`${f.url}-${i}`} className="flex items-center justify-between p-2 bg-teal-50 rounded">
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
              disabled={
                submitting || uploading || !formData.requestType || !formData.description || uploadedFiles.length === 0
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.submitting") || "Submitting"}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("member.claim.submit")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-600">{t("member.claim.notes.title")}</CardTitle>
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
